import React from "react";
import clsx from "clsx";

interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
}

function Table<T extends Record<string, any>>({
  columns,
  data,
  emptyMessage = "No records found.",
  className,
}: TableProps<T>) {
  return (
    <div
      className={clsx(
        "overflow-hidden rounded-[26px] border border-[#E8DFD8] bg-white",
        className
      )}
    >
      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead>

            <tr className="bg-[#F8F5F2]">

              {columns.map((column) => (

                <th
                  key={String(column.key)}
                  className={clsx(
                    "px-8 py-5 text-xs uppercase tracking-[0.16em] text-[#8C837D] font-semibold",

                    column.align === "center" && "text-center",

                    column.align === "right" && "text-right",

                    (!column.align || column.align === "left") && "text-left"
                  )}
                  style={{
                    width: column.width,
                  }}
                >
                  {column.header}
                </th>

              ))}

            </tr>

          </thead>

          <tbody>

            {data.length === 0 ? (

              <tr>

                <td
                  colSpan={columns.length}
                  className="py-20 text-center text-[#8A827B]"
                >
                  {emptyMessage}
                </td>

              </tr>

            ) : (

              data.map((row, index) => (

                <tr
                  key={index}
                  className="border-t border-[#F2ECE8] transition-all duration-200 hover:bg-[#FCFAF8]"
                >

                  {columns.map((column) => (

                    <td
                      key={String(column.key)}
                      className={clsx(
                        "px-8 py-6 text-[15px] text-[#413B37]",

                        column.align === "center" && "text-center",

                        column.align === "right" && "text-right",

                        (!column.align || column.align === "left") && "text-left"
                      )}
                    >
                      {column.render
                        ? column.render(row)
                        : row[column.key as keyof T]}
                    </td>

                  ))}

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Table; 