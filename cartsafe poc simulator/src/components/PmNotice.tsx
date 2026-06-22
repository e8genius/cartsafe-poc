"use client";

import React from "react";
import { Info } from "lucide-react";

interface PmNoticeProps {
  title: string;
  children: React.ReactNode;
}

export default function PmNotice({ title, children }: PmNoticeProps) {
  return (
    <div className="w-full bg-slate-900 border-t border-slate-800 text-slate-100 py-6 px-4 sm:px-8 mt-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="bg-indigo-600 text-white text-[10px] uppercase px-2 py-0.5 rounded font-bold tracking-wider">
            PM Note
          </span>
        </div>
        <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          {title}
        </h4>
        <div className="text-sm text-slate-300 leading-relaxed font-normal">
          {children}
        </div>
      </div>
    </div>
  );
}
