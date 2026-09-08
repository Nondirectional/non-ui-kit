import {
  createContext,
  forwardRef,
  HTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
  useContext,
} from 'react'
import { IconChevronDown } from '../../icons'
import { cn } from '../../cn'

/** 受控排序状态：key 对应 TableHead 的 sortKey；null 表示当前无排序 */
export interface TableSort {
  key: string
  direction: 'asc' | 'desc'
}

interface TableContextValue {
  sort: TableSort | null | undefined
  onSortChange: ((next: TableSort) => void) | undefined
}

/** sort === undefined 表示消费方未接受控排序，TableHead 据此退化为纯文本表头 */
const TableContext = createContext<TableContextValue>({ sort: undefined, onSortChange: undefined })

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** 受控排序状态（与 onSortChange 成对传入；不传则所有 sortKey 表头渲染为纯文本） */
  sort?: TableSort | null
  /** 点击可排序表头回调：同列翻转方向，新列用该列 initialDirection（默认降序） */
  onSortChange?: (next: TableSort) => void
}

/**
 * 语义表格（原生 table 封装，排行表/明细表统一配方，归拢自消费方 7 处
 * 散装 <table> 的公共形态）。排序只做受控状态交互——数据重排由消费方
 * 依据 sort 完成，组件不持有数据。
 *
 * 外层自带 overflow-x-auto 横向滚动容器（小屏宽表刚需）。注意该容器同时是
 * 纵向 sticky 的滚动祖先：需要限高滚动 + sticky 表头时在外层再包限高容器
 * 并给 th/td 追加 sticky 类（如 sticky top-0 z-10 bg-surface），组件不内置。
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { sort, onSortChange, className, ...rest },
  ref,
) {
  return (
    <div className="w-full overflow-x-auto">
      <TableContext.Provider value={{ sort, onSortChange }}>
        <table ref={ref} className={cn('w-full border-collapse text-sm', className)} {...rest} />
      </TableContext.Provider>
    </div>
  )
})

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableHeader({ ...rest }, ref) {
  return <thead ref={ref} {...rest} />
})

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableBody({ ...rest }, ref) {
    return <tbody ref={ref} {...rest} />
  },
)

/** 数据行：底分割线（末行去掉）+ hover 换底；整行置灰等行态由消费方追加 opacity 类 */
export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  function TableRow({ className, ...rest }, ref) {
    return (
      <tr
        ref={ref}
        className={cn(
          'border-b border-border last:border-b-0 transition-colors hover:bg-surface-hover',
          className,
        )}
        {...rest}
      />
    )
  },
)

interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** 声明该列可排序（Table 需同时传 sort + onSortChange 才生效） */
  sortKey?: string
  /** 非激活列首次点击的起始方向，默认 desc（排行场景数值降序优先；文本列可传 asc） */
  initialDirection?: 'asc' | 'desc'
}

/**
 * 表头单元格：thead 底分割线由本元素承担（tbody 行线在 TableRow）。
 * 基类不设 text-align：浏览器默认左对齐，数值/操作列自行追加 text-right
 * （基类若带 text-left 会与追加的 text-right 同族冲突，胜者不可预测）。
 * 可排序时内部渲染 button：激活列 text-fg + 方向 chevron（升序 rotate-180），
 * 非激活列 chevron opacity-0 占位避免列宽跳动；th 上维护 aria-sort。
 */
export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(function TableHead(
  { sortKey, initialDirection = 'desc', className, children, ...rest },
  ref,
) {
  const { sort, onSortChange } = useContext(TableContext)
  const sortable = sortKey !== undefined && sort !== undefined && onSortChange !== undefined
  const active = sortable && sort !== null && sort.key === sortKey
  const ariaSort = active ? (sort!.direction === 'asc' ? 'ascending' : 'descending') : undefined

  const handleClick = () => {
    if (!sortable || sortKey === undefined || onSortChange === undefined) return
    onSortChange(
      active
        ? { key: sortKey, direction: sort!.direction === 'asc' ? 'desc' : 'asc' }
        : { key: sortKey, direction: initialDirection },
    )
  }

  return (
    <th
      ref={ref}
      aria-sort={ariaSort}
      className={cn('border-b border-border px-3 py-2 text-xs font-medium text-fg-muted', className)}
      {...rest}
    >
      {sortable ? (
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            'inline-flex items-center gap-1 rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft',
            active ? 'text-fg' : 'text-fg-muted hover:text-fg',
          )}
        >
          {children}
          <IconChevronDown
            size={12}
            className={cn(
              'transition-transform',
              active ? 'opacity-100' : 'opacity-0',
              active && sort!.direction === 'asc' && 'rotate-180',
            )}
          />
        </button>
      ) : (
        children
      )}
    </th>
  )
})

/** 数据单元格：对齐方式（text-right / tabular-nums / font-mono 等）由消费方按列追加 */
export const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  function TableCell({ className, ...rest }, ref) {
    return <td ref={ref} className={cn('px-3 py-2', className)} {...rest} />
  },
)
