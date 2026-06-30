"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const onSelectChange = (nextLocale: string | null) => {
    if (!nextLocale) return;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale as "en" | "es" });
    });
  };

  return (
    <Select defaultValue={locale} onValueChange={onSelectChange} disabled={isPending}>
      <SelectTrigger className="w-[110px] h-9 gap-2">
        <span>Language</span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="es">Español</SelectItem>
      </SelectContent>
    </Select>
  );
}
