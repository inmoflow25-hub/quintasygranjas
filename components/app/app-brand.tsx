type AppBrandProps = {
  href?: string
  className?: string
  iconClassName?: string
  logoClassName?: string
}

export default function AppBrand({
  href = "/",
  className = "",
  iconClassName = "h-10 w-10",
  logoClassName = "h-14 w-auto"
}: AppBrandProps) {
  return (
    <a href={href} className={`flex items-center gap-3 ${className}`}>
      <img
        src="/logho quintas nuevo.svg"
        alt=""
        className={`${iconClassName} object-contain`}
      />

      <img
        src="/brand/qyg-logo.svg"
        alt="Quintas y Granjas"
        className={logoClassName}
      />
    </a>
  )
}
