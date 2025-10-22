interface PageHeadingProps {
  title?: string;
  children?: React.ReactNode;
}

export default function PageHeading({ title, children }: PageHeadingProps) {
  return (
    <div className="md:py-18 mb-16 bg-blue-100 px-6 py-12">
      <div className="container mx-auto flex max-w-4xl flex-col items-center justify-center gap-6 md:gap-8">
        <h1 className="text-center text-4xl font-bold !leading-tight text-blue-900 md:text-5xl">
          {title}
        </h1>
        {children && (
          <div className="text-start text-lg font-medium text-blue-700 md:text-xl">{children}</div>
        )}
      </div>
    </div>
  );
}
