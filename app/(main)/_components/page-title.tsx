type PageTitleProps = {
  title: string;
  subTitle?: string;
};

export default function PageTitle({
  title: pageTitle,
  subTitle: subPageTitle,
}: PageTitleProps) {
  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-medium">{pageTitle}</h1>
      {subPageTitle && (
        <h2 className="text-md mt-1 text-muted-foreground">{subPageTitle}</h2>
      )}
    </div>
  );
}
