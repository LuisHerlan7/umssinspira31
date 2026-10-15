export default function CompanyPlaceholderPage({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <main className="flex-1 bg-[#eeeae1] px-5 pb-3 pt-6 text-[#202d39] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-10 sm:mb-16">
          <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-[28px]">{title}</h1>
          <p className="mt-1.5 text-xs leading-5 text-[#7b858e]">{subtitle}</p>
        </div>
        <div className="rounded-[14px] border border-[#ded8cc] bg-white px-5 pb-[26px] pt-[18px] shadow-[0_1px_2px_rgba(38,55,71,0.02)] sm:px-[22px]">
          <p className="text-xs leading-5 text-[#7b858e]">Contenido pendiente de implementación.</p>
        </div>
      </div>
    </main>
  );
}
