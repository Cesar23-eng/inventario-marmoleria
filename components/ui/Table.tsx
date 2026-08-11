import React from 'react'
import { twMerge } from 'tailwind-merge'

export function Table({ className, children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
      <table className={twMerge("w-full text-sm text-left text-zinc-600", className)} {...props}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={twMerge("text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200", className)} {...props}>
      {children}
    </thead>
  )
}

export function TableBody({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  )
}

export function TableRow({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={twMerge("border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors", className)} {...props}>
      {children}
    </tr>
  )
}

export function TableHead({ className, children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th scope="col" className={twMerge("px-6 py-4 font-medium", className)} {...props}>
      {children}
    </th>
  )
}

export function TableCell({ className, children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={twMerge("px-6 py-4", className)} {...props}>
      {children}
    </td>
  )
}
