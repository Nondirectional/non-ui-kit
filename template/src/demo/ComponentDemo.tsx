import { useState, type ReactNode } from 'react'
import {
  AppDialog,
  Button,
  DatePicker,
  DateTimePicker,
  Dot,
  Input,
  MultiSelect,
  Select,
  SelectItem,
  Textarea,
  Tooltip,
  todayInput,
  useConfirm,
  useToast,
  type MultiSelectOption,
} from '@non/ui'

/** 组件分区卡片：标题 + 描述 + 内容 */
function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-md border border-border bg-surface p-4 shadow-sm">
      <h2 className="text-sm font-medium text-fg">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-fg-muted">{description}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

function ButtonDemo() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary">主要操作</Button>
        <Button>次要操作</Button>
        <Button variant="ghost">行内低强调</Button>
        <Button variant="danger-text">删除</Button>
        <Button variant="danger-solid">确认销毁</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm">sm 按钮</Button>
        <Button variant="primary" size="sm">
          sm 主要
        </Button>
        <Button loading>加载中</Button>
        <Button disabled>禁用</Button>
      </div>
    </div>
  )
}

function InputDemo() {
  return (
    <div className="grid max-w-md gap-3">
      <div>
        <label htmlFor="demo-name" className="mb-1 block text-xs text-fg-muted">
          名称
        </label>
        <Input id="demo-name" placeholder="请输入名称" />
      </div>
      <div>
        <label htmlFor="demo-desc" className="mb-1 block text-xs text-fg-muted">
          描述
        </label>
        <Textarea id="demo-desc" placeholder="支持多行输入" />
      </div>
    </div>
  )
}

const STATUS_OPTIONS = [
  { value: 'todo', label: '待处理' },
  { value: 'doing', label: '进行中' },
  { value: 'done', label: '已完成' },
  { value: 'canceled', label: '已取消' },
]

function SelectDemo() {
  const [status, setStatus] = useState('')
  return (
    <div className="flex max-w-md flex-col gap-3">
      {/* 受控：value ''/undefined = 占位符；'' 会由组件过滤（Radix 禁空值项） */}
      <Select
        value={status}
        onValueChange={setStatus}
        placeholder="选择状态"
        aria-label="状态选择"
      >
        {STATUS_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </Select>
      {/* searchable：弹层内置搜索（长列表场景），键盘 ↑↓/Enter/Esc 可用 */}
      <Select
        value="beijing"
        onValueChange={() => {}}
        placeholder="选择城市"
        searchable
        aria-label="城市选择"
      >
        {['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安'].map((city) => (
          <SelectItem key={city} value={city}>{city}</SelectItem>
        ))}
      </Select>
      {status && (
        <p className="text-xs text-fg-muted">
          当前选中：
          <span className="font-mono text-fg">{status}</span>
        </p>
      )}
    </div>
  )
}

const MEMBER_OPTIONS: MultiSelectOption[] = [
  { value: 'u1', label: '张三' },
  { value: 'u2', label: '李四' },
  { value: 'u3', label: '王五' },
  { value: 'u4', label: '赵六' },
  { value: 'u5', label: '钱七' },
]

function MultiSelectDemo() {
  const [members, setMembers] = useState<string[]>(['u1', 'u2'])
  return (
    <div className="max-w-md">
      <MultiSelect
        options={MEMBER_OPTIONS}
        value={members}
        onValueChange={setMembers}
        placeholder="选择参与人"
        overflowUnit="人"
        aria-label="参与人多选"
      />
      <p className="mt-2 text-xs text-fg-muted">
        已选 {members.length} 人（勾选后菜单不关闭，可连点）
      </p>
    </div>
  )
}

function PickerDemo() {
  const [date, setDate] = useState('')
  const [datetime, setDatetime] = useState('')
  return (
    <div className="flex max-w-md flex-wrap gap-3">
      <div className="min-w-44 flex-1">
        <label htmlFor="demo-date" className="mb-1 block text-xs text-fg-muted">
          截止日期（max=今天）
        </label>
        <DatePicker id="demo-date" value={date} onChange={setDate} max={todayInput()} />
      </div>
      <div className="min-w-44 flex-1">
        <label htmlFor="demo-dt" className="mb-1 block text-xs text-fg-muted">
          计划时间
        </label>
        <DateTimePicker id="demo-dt" value={datetime} onChange={setDatetime} />
      </div>
    </div>
  )
}

function DialogDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开对话框</Button>
      <AppDialog
        open={open}
        onOpenChange={setOpen}
        title="示例对话框"
        footer={
          <>
            <Button onClick={() => setOpen(false)}>取消</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              保存
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg-muted">
          AppDialog 只管壳：overlay、面板、标题行与关闭钮；表单语义与提交行为由调用方决定。
        </p>
        <div className="mt-3">
          <Input placeholder="对话框内输入框" aria-label="对话框内输入框" />
        </div>
      </AppDialog>
    </>
  )
}

function FeedbackDemo() {
  const toast = useToast()
  const { confirm } = useConfirm()

  const requestDelete = async () => {
    // 调用形态与原生 confirm 对位：否即 return
    if (!(await confirm({ title: '删除该条目？', description: '此操作不可撤销。', danger: true, confirmText: '删除' }))) {
      return
    }
    toast.success('已删除')
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={() => toast.success('操作已保存')}>成功 Toast</Button>
      <Button onClick={() => toast.error('网络请求失败')}>失败 Toast</Button>
      <Button
        onClick={() =>
          confirm({ title: '确认继续？', description: '普通确认：确认按钮为主色。' }).then((ok) =>
            toast[ok ? 'success' : 'error'](ok ? '已确认' : '已取消'),
          )
        }
      >
        确认弹窗
      </Button>
      <Button variant="danger-text" onClick={requestDelete}>
        危险操作确认
      </Button>
    </div>
  )
}

function TooltipDotDemo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Tooltip label="Tooltip 包裹且仅包裹一个元素">
        <button
          type="button"
          className="cursor-pointer text-sm text-accent underline-offset-2 hover:underline"
        >
          悬停查看气泡
        </button>
      </Tooltip>
      <Tooltip label="条件提示（label 为 falsy 时原样返回 children）" side="right">
        <Button size="sm">右侧气泡</Button>
      </Tooltip>
      <span className="flex items-center gap-1.5 text-sm text-fg-muted">
        <Dot label="有未读" />
        徽标圆点（sr-only 标签）
      </span>
    </div>
  )
}

const SECTIONS = [
  { title: 'Button', description: '5 variant × 2 size，loading 强制禁用；icon-only 按钮不走它', node: <ButtonDemo /> },
  { title: 'Input / Textarea', description: '原生控件薄封装；className 只追加布局类', node: <InputDemo /> },
  { title: 'Select', description: '受控下拉（Radix）；searchable 弹层内置搜索', node: <SelectDemo /> },
  { title: 'MultiSelect', description: '多选；勾选不关菜单；预览超限折叠为「等 N 人」', node: <MultiSelectDemo /> },
  { title: 'DatePicker / DateTimePicker', description: '周一起始月历，本地时区，无日期库依赖', node: <PickerDemo /> },
  { title: 'AppDialog', description: '统一对话框壳', node: <DialogDemo /> },
  { title: 'Toast / Confirm', description: '全局轻提示与 Promise 化确认弹窗', node: <FeedbackDemo /> },
  { title: 'Tooltip / Dot', description: '反色气泡（bg-fg text-bg）与徽标圆点', node: <TooltipDotDemo /> },
]

export function ComponentDemo() {
  return (
    <div className="space-y-4">
      {SECTIONS.map((s) => (
        <Section key={s.title} title={s.title} description={s.description}>
          {s.node}
        </Section>
      ))}
    </div>
  )
}
