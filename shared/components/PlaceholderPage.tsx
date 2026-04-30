import { ChevronRight } from "lucide-react"

type PlaceholderPageProps = {
  title: string
  description: string
  actions?: string[]
}

export function PlaceholderPage({
  title,
  description,
  actions = [],
}: PlaceholderPageProps) {
  return (
    <section className="space-y-4">
      <header className="rounded-[10px] bg-green-dark px-4 py-[14px] text-cream">
        <p className="text-[10px] font-normal tracking-[0.06em] text-green-muted">
          Phase 1 scaffold
        </p>
        <h2 className="mt-1 text-[19px] font-semibold">{title}</h2>
        <p className="mt-1 max-w-2xl text-[11px] font-normal leading-5 text-green-muted">
          {description}
        </p>
      </header>

      <div className="rounded-[10px] border border-border bg-card px-3 py-3">
        <p className="text-[10px] font-semibold tracking-[0.04em] text-text-muted">
          Expected work
        </p>
        <div className="mt-3 space-y-2">
          {(actions.length > 0 ? actions : ["Implementation pending"]).map(
            (action) => (
              <div
                key={action}
                className="flex items-center gap-2 rounded-[8px] border border-border bg-card px-[10px] py-2 text-[13px] text-text-dark"
              >
                <ChevronRight className="h-4 w-4 text-green-mid" />
                <span>{action}</span>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  )
}
