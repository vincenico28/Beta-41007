import { useState, useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, CheckCheck, Info, CheckCircle, AlertTriangle, XCircle,
  Calendar, Clock, Megaphone, Settings2, Filter, ExternalLink,
  Send, Trash2, Volume2, ShieldAlert, Sparkles, Building2, Users,
  UserCheck, AlertCircle, ArrowRight, DollarSign, CheckSquare, PlusCircle,
  Paperclip, FileText, Image as ImageIcon, UploadCloud, Download, Eye, X, Loader2,
  Inbox, History, ListFilter
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { usePermissions } from '@/hooks/use-permissions'
import {
  useNotifications, useAllNotifications, useMarkNotificationRead, useMarkAllNotificationsRead,
  useSendNotification, useDeleteNotification, useClearReadNotifications
} from '@/hooks/use-notifications'
import { useEmployees } from '@/hooks/use-employees'
import { useDepartments } from '@/hooks/use-misc'
import { useLeaveRequests } from '@/hooks/use-leaves'
import { useAttendance } from '@/hooks/use-attendance'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { playNotificationSound } from '@/utils/notification-sound'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Notification } from '@/types'

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; className: string; dot: string; badgeClass: string }> = {
  info: {
    label: 'Information',
    icon: Info,
    className: 'bg-blue-500/10 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
    dot: 'bg-blue-500',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
  },
  success: {
    label: 'Success',
    icon: CheckCircle,
    className: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
  warning: {
    label: 'Warning',
    icon: AlertTriangle,
    className: 'bg-amber-500/10 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
    dot: 'bg-amber-500',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  },
  error: {
    label: 'Urgent / Error',
    icon: XCircle,
    className: 'bg-red-500/10 text-red-600 dark:bg-red-950/50 dark:text-red-400',
    dot: 'bg-red-500',
    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
  },
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType }> = {
  attendance: { label: 'Attendance', icon: Clock },
  leave: { label: 'Leave', icon: Calendar },
  schedule: { label: 'Schedule', icon: Calendar },
  system: { label: 'System', icon: Settings2 },
  announcement: { label: 'Announcement', icon: Megaphone },
  payroll: { label: 'Payroll', icon: DollarSign },
}

// Helper to upload attachment to Supabase storage with fallback
async function uploadNotificationAttachment(file: File): Promise<{ url: string; name: string }> {
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const fileName = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${sanitizedName}`
  
  let uploadResult = await supabase.storage.from('notification_attachments').upload(`public/${fileName}`, file, {
    cacheControl: '3600',
    upsert: false
  })

  let bucketName = 'notification_attachments'

  if (uploadResult.error) {
    console.warn('notification_attachments upload failed, attempting fallback to leave_attachments:', uploadResult.error)
    const fallbackResult = await supabase.storage.from('leave_attachments').upload(`public/${fileName}`, file, {
      cacheControl: '3600',
      upsert: false
    })
    if (fallbackResult.error) {
      throw uploadResult.error
    }
    bucketName = 'leave_attachments'
  }

  const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(`public/${fileName}`)
  return {
    url: publicUrlData.publicUrl,
    name: file.name,
  }
}

// ================= DISPATCH PUSH NOTIFICATION MODAL (HR SUPERPOWER) =================
function DispatchNotificationDialog({ departments, employees }: { departments?: any[]; employees?: any[] }) {
  const [open, setOpen] = useState(false)
  const sendMutation = useSendNotification()
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const [form, setForm] = useState({
    targetType: 'all', // 'all' | 'dept' | 'single'
    department_id: '',
    employee_id: '',
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    category: 'system' as 'attendance' | 'leave' | 'schedule' | 'system' | 'announcement',
    action_url: '',
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 15 * 1024 * 1024) {
        toast.error('File too large', { description: 'Maximum file size allowed is 15MB' })
        return
      }
      setAttachedFile(file)
    }
  }

  const removeAttachedFile = () => {
    setAttachedFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Notification title is required')
      return
    }

    let targetIds: string[] = []

    if (form.targetType === 'all') {
      if (employees && employees.length > 0) {
        targetIds = employees.map(e => e.id)
      } else {
        const { data: fallbackEmps } = await supabase.from('employees').select('id')
        targetIds = (fallbackEmps ?? []).map(e => e.id)
      }
    } else if (form.targetType === 'dept') {
      if (!form.department_id) {
        toast.error('Please select a target department')
        return
      }
      targetIds = (employees ?? []).filter(e => e.department_id === form.department_id).map(e => e.id)
    } else if (form.targetType === 'single') {
      if (!form.employee_id) {
        toast.error('Please select a recipient employee')
        return
      }
      targetIds = [form.employee_id]
    }

    if (targetIds.length === 0) {
      toast.error('No matching recipient found')
      return
    }

    setIsUploading(true)
    let attachment_url: string | undefined = undefined
    let attachment_name: string | undefined = undefined

    if (attachedFile) {
      try {
        const uploadRes = await uploadNotificationAttachment(attachedFile)
        attachment_url = uploadRes.url
        attachment_name = uploadRes.name
      } catch (uploadErr: any) {
        setIsUploading(false)
        toast.error('Failed to upload file attachment', { description: uploadErr.message })
        return
      }
    }

    try {
      await sendMutation.mutateAsync({
        employee_ids: targetIds,
        title: form.title,
        message: form.message || undefined,
        type: form.type,
        category: form.category,
        action_url: form.action_url || undefined,
        attachment_url,
        attachment_name,
      })

      playNotificationSound()
      toast.success(`Dispatched push alert to ${targetIds.length} recipient${targetIds.length !== 1 ? 's' : ''}${attachedFile ? ' with attached file' : ''}!`)
      setOpen(false)
      setAttachedFile(null)
      setForm({
        targetType: 'all',
        department_id: '',
        employee_id: '',
        title: '',
        message: '',
        type: 'info',
        category: 'system',
        action_url: '',
      })
    } catch (err: any) {
      toast.error('Failed to dispatch notification: ' + err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5 shadow-xs">
          <Send className="size-4" />
          Dispatch Push Alert
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="size-5 text-primary" />
            Send Targeted Push Notification
          </DialogTitle>
          <DialogDescription>
            Broadcast an instant push alert and audio chime with optional document attachments to all employees, a department, or a single staff member.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Target Audience *</Label>
            <Select value={form.targetType} onValueChange={v => setForm(p => ({ ...p, targetType: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Company-Wide (All Active Employees)</SelectItem>
                <SelectItem value="dept">Specific Department</SelectItem>
                <SelectItem value="single">Individual Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.targetType === 'dept' && (
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Select Department *</Label>
              <Select value={form.department_id} onValueChange={v => setForm(p => ({ ...p, department_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Choose Department" /></SelectTrigger>
                <SelectContent>
                  {departments?.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {form.targetType === 'single' && (
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Select Employee *</Label>
              <Select value={form.employee_id} onValueChange={v => setForm(p => ({ ...p, employee_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Choose Employee" /></SelectTrigger>
                <SelectContent>
                  {employees?.map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.first_name} {e.last_name} ({e.departments?.name || 'Operations'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Notification Title *</Label>
            <Input
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Action Required: Submit Q3 Compliance Records"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Severity Level</Label>
              <Select value={form.type} onValueChange={(v: any) => setForm(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Information (Blue)</SelectItem>
                  <SelectItem value="success">Success (Green)</SelectItem>
                  <SelectItem value="warning">Warning (Amber)</SelectItem>
                  <SelectItem value="error">Urgent / Priority (Red)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Category</Label>
              <Select value={form.category} onValueChange={(v: any) => setForm(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="leave">Leave</SelectItem>
                  <SelectItem value="schedule">Schedule</SelectItem>
                  <SelectItem value="payroll">Payroll</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Message Details</Label>
            <Textarea
              value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              placeholder="Provide detailed instructions, announcement notes, or memo details..."
              rows={3}
            />
          </div>

          {/* ATTACHED FILE INPUT */}
          <div className="space-y-1.5 pt-1">
            <Label className="text-xs font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Paperclip className="size-3.5 text-primary" /> Attach File / Document (Optional)
              </span>
              <span className="text-[10px] text-muted-foreground">PDF, DOC, XLS, PNG, JPG (Max 15MB)</span>
            </Label>
            
            {!attachedFile ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border/80 hover:border-primary/50 hover:bg-muted/40 rounded-lg p-3.5 cursor-pointer transition-colors group">
                <UploadCloud className="size-6 text-muted-foreground group-hover:text-primary transition-colors mb-1" />
                <span className="text-xs font-medium text-foreground">Click or drag a file to attach</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Supports Memos, DOLE Forms, Payslips, Circulars, Photos</span>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.zip" 
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-primary/30 bg-primary/5 dark:bg-primary/10">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    {attachedFile.type.startsWith('image/') ? (
                      <ImageIcon className="size-4 text-primary" />
                    ) : (
                      <FileText className="size-4 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate text-foreground">{attachedFile.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {(attachedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={removeAttachedFile}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Action Link URL (Optional)</Label>
            <Input
              value={form.action_url}
              onChange={e => setForm(p => ({ ...p, action_url: e.target.value }))}
              placeholder="e.g. /app/attendance, /app/leaves, or /app/payroll"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={sendMutation.isPending || isUploading} className="gap-1.5">
              {isUploading || sendMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {isUploading ? 'Uploading file...' : 'Dispatching...'}
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Dispatch Alert
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ================= NOTIFICATION ITEM COMPONENT =================
function NotificationItem({
  notif,
  employeeId,
  onDelete,
}: {
  notif: Notification
  employeeId: string
  onDelete: (id: string) => void
}) {
  const navigate = useNavigate()
  const { mutate: markOne } = useMarkNotificationRead()
  const type = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.info
  const category = CATEGORY_CONFIG[notif.category] ?? CATEGORY_CONFIG.system
  const Icon = type.icon
  const CategoryIcon = category.icon

  const handleClick = () => {
    if (!notif.is_read) {
      markOne(notif.id)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          onClick={handleClick}
          className={cn(
            'group relative flex items-start gap-4 rounded-xl border border-border p-4 transition-all hover:shadow-sm cursor-pointer',
            !notif.is_read ? 'bg-primary/[0.03] border-primary/20' : 'hover:bg-muted/30',
          )}
        >
          {!notif.is_read && (
            <span className={cn('absolute right-3.5 top-3.5 size-2 rounded-full ring-2 ring-background', type.dot)} />
          )}

          <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl shadow-xs', type.className)}>
            <Icon className="size-5" />
          </div>

          <div className="min-w-0 flex-1 pr-6">
            <div className="mb-1 flex items-center gap-2">
              <p className={cn(
                'text-sm font-semibold truncate',
                !notif.is_read ? 'text-foreground' : 'text-muted-foreground',
              )}>
                {notif.title}
              </p>
              {notif.action_url && (
                <ExternalLink className="size-3 text-muted-foreground/60 shrink-0" />
              )}
            </div>

            {notif.message && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{notif.message}</p>
            )}

            {/* Attached File Pill */}
            {notif.attachment_url && (
              <div className="mt-2 flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                  <Paperclip className="size-3" />
                  {notif.attachment_name || '1 Attached Document'}
                </span>
              </div>
            )}

            <div className="mt-2.5 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1 font-medium">
                <CategoryIcon className="size-3 text-muted-foreground/70" />
                {category.label}
              </span>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
              </span>
              {!notif.is_read && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-bold bg-primary/10 text-primary">
                  NEW
                </Badge>
              )}
            </div>
          </div>

          <div className="shrink-0 flex items-center" onClick={e => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
              onClick={() => onDelete(notif.id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge className={cn('text-xs gap-1', type.badgeClass)}>
              <Icon className="size-3" />
              {type.label}
            </Badge>
            <Badge variant="outline" className="text-xs gap-1">
              <CategoryIcon className="size-3 text-muted-foreground" />
              {category.label}
            </Badge>
          </div>
          <DialogTitle className="text-lg">{notif.title}</DialogTitle>
          <p className="text-xs text-muted-foreground pt-0.5">
            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
          </p>
        </DialogHeader>

        {notif.message && (
          <div className="mt-2 text-sm leading-relaxed whitespace-pre-wrap border-t border-border pt-4 text-foreground/90">
            {notif.message}
          </div>
        )}

        {/* ATTACHMENT DETAILS CARD & PREVIEW */}
        {notif.attachment_url && (
          <div className="mt-4 rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <Paperclip className="size-3.5 text-primary" /> Attached Document
              </span>
              <Badge variant="secondary" className="text-[10px] font-medium">1 Attachment</Badge>
            </div>

            {/* Image Preview if applicable */}
            {/\.(png|jpe?g|webp|gif|svg)$/i.test(notif.attachment_url) && (
              <div className="relative rounded-lg overflow-hidden border border-border bg-black/5 max-h-52 flex items-center justify-center p-1">
                <img 
                  src={notif.attachment_url} 
                  alt={notif.attachment_name || 'Attachment Preview'} 
                  className="max-h-48 w-auto object-contain rounded-lg shadow-xs"
                />
              </div>
            )}

            <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  {/\.(png|jpe?g|webp|gif|svg)$/i.test(notif.attachment_url) ? (
                    <ImageIcon className="size-4 text-primary" />
                  ) : (
                    <FileText className="size-4 text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate text-foreground">{notif.attachment_name || 'Attached File'}</p>
                  <p className="text-[10px] text-muted-foreground">Click to view in browser or download</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1"
                >
                  <a href={notif.attachment_url} target="_blank" rel="noopener noreferrer">
                    <Eye className="size-3.5" /> View
                  </a>
                </Button>
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="h-8 text-xs gap-1"
                >
                  <a href={notif.attachment_url} download={notif.attachment_name || 'attachment'} target="_blank" rel="noopener noreferrer">
                    <Download className="size-3.5" /> Download
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="pt-3 flex items-center justify-between sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-destructive hover:text-destructive gap-1"
            onClick={() => onDelete(notif.id)}
          >
            <Trash2 className="size-3.5" /> Delete
          </Button>

          <div className="flex items-center gap-2">
            {notif.action_url && (
              <Button
                onClick={() => navigate(notif.action_url!)}
                className="gap-1.5 text-xs"
              >
                Go to Details <ExternalLink className="size-3.5" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ================= SENT NOTIFICATION / BROADCAST ITEM COMPONENT =================
function SentNotificationItem({
  notif,
  onDelete,
}: {
  notif: Notification & { employees?: any }
  onDelete: (id: string) => void
}) {
  const navigate = useNavigate()
  const type = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.info
  const category = CATEGORY_CONFIG[notif.category] ?? CATEGORY_CONFIG.system
  const Icon = type.icon
  const CategoryIcon = category.icon
  const recipient = notif.employees

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group relative flex items-start gap-4 rounded-xl border border-border p-4 transition-all hover:shadow-sm cursor-pointer hover:bg-muted/30 bg-card">
          <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl shadow-xs', type.className)}>
            <Icon className="size-5" />
          </div>

          <div className="min-w-0 flex-1 pr-6">
            <div className="mb-1 flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-foreground truncate">
                {notif.title}
              </p>
              {recipient ? (
                <Badge variant="outline" className="text-[10px] font-medium gap-1 bg-muted/40 text-foreground/80 border-border">
                  <UserCheck className="size-3 text-muted-foreground" />
                  To: {recipient.first_name} {recipient.last_name} {recipient.departments?.name ? `(${recipient.departments.name})` : ''}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] font-medium gap-1 bg-muted/40 text-foreground/80 border-border">
                  <Users className="size-3 text-muted-foreground" />
                  Target Broadcast
                </Badge>
              )}
            </div>

            {notif.message && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{notif.message}</p>
            )}

            {/* Attached File Pill */}
            {notif.attachment_url && (
              <div className="mt-2 flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                  <Paperclip className="size-3" />
                  {notif.attachment_name || '1 Attached Document'}
                </span>
              </div>
            )}

            <div className="mt-2.5 flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1 font-medium">
                <CategoryIcon className="size-3 text-muted-foreground/70" />
                {category.label}
              </span>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })} ({new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
              </span>
              <span>•</span>
              <Badge variant={notif.is_read ? 'secondary' : 'outline'} className={cn(
                'text-[9px] px-1.5 py-0 h-4 font-semibold',
                notif.is_read ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300 border-amber-300'
              )}>
                {notif.is_read ? 'Recipient Read' : 'Delivered (Pending Read)'}
              </Badge>
            </div>
          </div>

          <div className="shrink-0 flex items-center" onClick={e => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
              onClick={() => onDelete(notif.id)}
              title="Delete notification record"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge className={cn('text-xs gap-1', type.badgeClass)}>
              <Icon className="size-3" />
              {type.label}
            </Badge>
            <Badge variant="outline" className="text-xs gap-1">
              <CategoryIcon className="size-3 text-muted-foreground" />
              {category.label}
            </Badge>
            {recipient && (
              <Badge variant="secondary" className="text-xs gap-1">
                <UserCheck className="size-3" />
                Recipient: {recipient.first_name} {recipient.last_name}
              </Badge>
            )}
          </div>
          <DialogTitle className="text-lg">{notif.title}</DialogTitle>
          <p className="text-xs text-muted-foreground pt-0.5">
            Dispatched on {new Date(notif.created_at).toLocaleString()} ({formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })})
          </p>
        </DialogHeader>

        {notif.message && (
          <div className="mt-2 text-sm leading-relaxed whitespace-pre-wrap border-t border-border pt-4 text-foreground/90">
            {notif.message}
          </div>
        )}

        {/* ATTACHMENT DETAILS CARD & PREVIEW */}
        {notif.attachment_url && (
          <div className="mt-4 rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <Paperclip className="size-3.5 text-primary" /> Attached Document
              </span>
              <Badge variant="secondary" className="text-[10px] font-medium">1 Attachment</Badge>
            </div>

            {/* Image Preview if applicable */}
            {/\.(png|jpe?g|webp|gif|svg)$/i.test(notif.attachment_url) && (
              <div className="relative rounded-lg overflow-hidden border border-border bg-black/5 max-h-52 flex items-center justify-center p-1">
                <img 
                  src={notif.attachment_url} 
                  alt={notif.attachment_name || 'Attachment Preview'} 
                  className="max-h-48 w-auto object-contain rounded-lg shadow-xs"
                />
              </div>
            )}

            <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  {/\.(png|jpe?g|webp|gif|svg)$/i.test(notif.attachment_url) ? (
                    <ImageIcon className="size-4 text-primary" />
                  ) : (
                    <FileText className="size-4 text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate text-foreground">{notif.attachment_name || 'Attached File'}</p>
                  <p className="text-[10px] text-muted-foreground">Click to view in browser or download</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1"
                >
                  <a href={notif.attachment_url} target="_blank" rel="noopener noreferrer">
                    <Eye className="size-3.5" /> View
                  </a>
                </Button>
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="h-8 text-xs gap-1"
                >
                  <a href={notif.attachment_url} download={notif.attachment_name || 'attachment'} target="_blank" rel="noopener noreferrer">
                    <Download className="size-3.5" /> Download
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="pt-3 flex items-center justify-between sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-destructive hover:text-destructive gap-1"
            onClick={() => onDelete(notif.id)}
          >
            <Trash2 className="size-3.5" /> Delete
          </Button>

          <div className="flex items-center gap-2">
            {notif.action_url && (
              <Button
                onClick={() => navigate(notif.action_url!)}
                className="gap-1.5 text-xs"
              >
                Go to Target Link <ExternalLink className="size-3.5" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ================= MAIN NOTIFICATIONS PAGE =================
export default function NotificationsPage() {
  const navigate = useNavigate()
  const { employee } = useAuthStore()
  const { can } = usePermissions()
  const { data: notifications, isLoading } = useNotifications()
  const { data: allNotifications, isLoading: isAllLoading } = useAllNotifications()
  const { data: departments } = useDepartments()
  const { data: employees } = useEmployees()

  // Extra context queries for HR Action Items
  const { data: pendingLeaves } = useLeaveRequests()
  const { data: todayAttendance } = useAttendance()

  const markAllMutation = useMarkAllNotificationsRead()
  const deleteMutation = useDeleteNotification()
  const clearReadMutation = useClearReadNotifications()

  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'all'>('inbox')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [readFilter, setReadFilter] = useState('all')
  const [search, setSearch] = useState('')

  // HR Pending Action Counters
  const hrPendingCount = useMemo(() => {
    const unapprovedLeaves = (pendingLeaves ?? []).filter(l => l.status === 'pending' || l.status === 'pending_hr').length
    const missingClockOuts = (todayAttendance ?? []).filter(a => a.clock_in && !a.clock_out).length
    return { unapprovedLeaves, missingClockOuts, total: unapprovedLeaves + missingClockOuts }
  }, [pendingLeaves, todayAttendance])

  // Filtered list for "My Inbox"
  const filteredInbox = useMemo(() => {
    return (notifications ?? []).filter(n => {
      const matchSearch = !search || 
        n.title.toLowerCase().includes(search.toLowerCase()) || 
        (n.message && n.message.toLowerCase().includes(search.toLowerCase()))
      const matchCat = categoryFilter === 'all' || n.category === categoryFilter
      const matchRead = readFilter === 'all' || (readFilter === 'unread' ? !n.is_read : n.is_read)
      return matchSearch && matchCat && matchRead
    })
  }, [notifications, search, categoryFilter, readFilter])

  // Filtered list for "Sent Broadcasts & History"
  const filteredSent = useMemo(() => {
    return (allNotifications ?? []).filter(n => {
      const matchSearch = !search || 
        n.title.toLowerCase().includes(search.toLowerCase()) || 
        (n.message && n.message.toLowerCase().includes(search.toLowerCase())) ||
        (n.employees?.first_name && n.employees.first_name.toLowerCase().includes(search.toLowerCase())) ||
        (n.employees?.last_name && n.employees.last_name.toLowerCase().includes(search.toLowerCase()))
      const matchCat = categoryFilter === 'all' || n.category === categoryFilter
      const matchRead = readFilter === 'all' || (readFilter === 'unread' ? !n.is_read : n.is_read)
      return matchSearch && matchCat && matchRead
    })
  }, [allNotifications, search, categoryFilter, readFilter])

  const unreadCount = useMemo(() => {
    return (notifications ?? []).filter(n => !n.is_read).length
  }, [notifications])

  const handleMarkAllRead = async () => {
    try {
      await markAllMutation.mutateAsync()
      toast.success('All notifications marked as read')
    } catch (err: any) {
      toast.error('Failed: ' + err.message)
    }
  }

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Notification removed')
    } catch (err: any) {
      toast.error('Delete failed: ' + err.message)
    }
  }

  const handleClearAllRead = async () => {
    try {
      await clearReadMutation.mutateAsync()
      toast.success('Cleared read notifications')
    } catch (err: any) {
      toast.error('Clear failed: ' + err.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">Notification Center</h1>
            {unreadCount > 0 && (
              <Badge className="rounded-full px-2 py-0.5 text-xs font-bold bg-primary text-primary-foreground">
                {unreadCount} Unread
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Real-time administrative alerts, workflow triggers, and workforce push notifications
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => {
              playNotificationSound()
              toast.info('🔔 Chime Test Played')
            }}
          >
            <Volume2 className="size-3.5" />
            Test Chime
          </Button>

          {can.isHR() && (
            <DispatchNotificationDialog
              departments={departments}
              employees={employees}
            />
          )}
        </div>
      </div>

      {/* HR ACTION REQUIRED BAR (FOR MANAGERS & HR) */}
      {can.isHR() && hrPendingCount.total > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/60 dark:bg-amber-950/20 shadow-xs">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  <ShieldAlert className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                    HR Action Required ({hrPendingCount.total} items pending review)
                  </h3>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                    {hrPendingCount.unapprovedLeaves} leave requests waiting approval • {hrPendingCount.missingClockOuts} unresolved timecard clock-outs
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {hrPendingCount.unapprovedLeaves > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs bg-background/80 border-amber-300 hover:bg-background gap-1"
                    onClick={() => navigate('/app/leaves')}
                  >
                    Review Leaves <ArrowRight className="size-3" />
                  </Button>
                )}
                {hrPendingCount.missingClockOuts > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs bg-background/80 border-amber-300 hover:bg-background gap-1"
                    onClick={() => navigate('/app/attendance')}
                  >
                    Check Timecards <ArrowRight className="size-3" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TABS HEADER (INBOX vs SENT BROADCAST HISTORY vs ALL ACTIVITY) */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-2">
          <TabsList className="grid grid-cols-2 sm:inline-flex h-9 bg-muted/60 p-1">
            <TabsTrigger value="inbox" className="text-xs gap-1.5">
              <Inbox className="size-3.5" />
              My Inbox
              {unreadCount > 0 && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 font-bold ml-1">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>

            {can.isHR() && (
              <TabsTrigger value="sent" className="text-xs gap-1.5">
                <History className="size-3.5" />
                Sent Broadcasts & History
                {allNotifications && allNotifications.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-1">
                    {allNotifications.length}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          <span className="text-xs text-muted-foreground hidden md:inline-block">
            {activeTab === 'inbox' 
              ? `Showing notifications addressed to you (${filteredInbox.length})`
              : `Showing company-wide broadcast log (${filteredSent.length})`}
          </span>
        </div>

        {/* Filter & Management Controls */}
        <Card className="p-3.5 border-border/70 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Input
                  placeholder={activeTab === 'inbox' ? "Search inbox alerts..." : "Search sent broadcasts, recipient, message..."}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="leave">Leave</SelectItem>
                  <SelectItem value="schedule">Schedule</SelectItem>
                  <SelectItem value="payroll">Payroll</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>

              <Select value={readFilter} onValueChange={setReadFilter}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread Only</SelectItem>
                  <SelectItem value="read">Read Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeTab === 'inbox' && (
              <div className="flex items-center gap-2 shrink-0">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllRead}
                    disabled={markAllMutation.isPending}
                    className="h-8 text-xs gap-1"
                  >
                    <CheckCheck className="size-3.5" /> Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllRead}
                  disabled={clearReadMutation.isPending}
                  className="h-8 text-xs text-muted-foreground hover:text-destructive gap-1"
                >
                  <Trash2 className="size-3.5" /> Clear read
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* TAB CONTENT: MY INBOX */}
        <TabsContent value="inbox" className="mt-0 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 rounded-xl border border-border p-4">
                  <Skeleton className="size-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredInbox.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 bg-card/40">
              <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                <Inbox className="size-7 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-semibold">No notifications in your inbox</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {readFilter === 'unread' ? "You're all caught up with your updates!" : 'No alerts match the selected filter criteria.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInbox.some(n => !n.is_read) && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Unread Alerts</p>
                  {filteredInbox.filter(n => !n.is_read).map(n => (
                    <NotificationItem
                      key={n.id}
                      notif={n}
                      employeeId={employee?.id ?? ''}
                      onDelete={handleDeleteNotification}
                    />
                  ))}
                </div>
              )}

              {filteredInbox.some(n => n.is_read) && (
                <div className="space-y-2 pt-2">
                  {filteredInbox.some(n => !n.is_read) && (
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Earlier History</p>
                  )}
                  {filteredInbox.filter(n => n.is_read).map(n => (
                    <NotificationItem
                      key={n.id}
                      notif={n}
                      employeeId={employee?.id ?? ''}
                      onDelete={handleDeleteNotification}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* TAB CONTENT: SENT BROADCASTS & HISTORY */}
        {can.isHR() && (
          <TabsContent value="sent" className="mt-0 space-y-4">
            {isAllLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-4 rounded-xl border border-border p-4">
                    <Skeleton className="size-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredSent.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 bg-card/40">
                <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                  <Send className="size-7 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-semibold">No sent broadcasts recorded</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  When you dispatch targeted alerts or attach memos, they will be tracked here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Sent Alerts & Broadcast History ({filteredSent.length})
                  </p>
                </div>
                <div className="space-y-3">
                  {filteredSent.map(n => (
                    <SentNotificationItem
                      key={n.id}
                      notif={n}
                      onDelete={handleDeleteNotification}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
