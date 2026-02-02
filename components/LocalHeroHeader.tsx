'use client';

import { Award } from 'lucide-react';
import Link from 'next/link';

interface LocalHeroHeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export function LocalHeroHeader({ title, description, actions }: LocalHeroHeaderProps) {
  return (
    <div className="border-b bg-white shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/local-hero/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#8dbf65] rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
              <p className="text-sm text-slate-600 mt-1">{description}</p>
            </div>
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
