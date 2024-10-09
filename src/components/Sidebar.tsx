import SelectBox from "./SelectBox";

import { languages, sorts } from "@/lib/options";
import templates from "@/lib/options/templates";
import { filters } from "@/lib/signals";

type Props = {};

export default function Sidebar({}: Props) {
  return (
    <aside className="height_witout_border w-60 min-w-60 flex-shrink-0 overflow-y-auto border-r border-neutral-800 bg-neutral-900 px-6 py-6 scrollbar-hide">
      <h3 className="text-lg font-medium text-neutral-200">Filters</h3>

      <div className="my-2 space-y-2 font-medium text-gray-400">
        <SelectBox
          label="Sort by"
          options={sorts}
          initialOption={filters.sortBy.value}
          onChange={(option) => (filters.sortBy.value = option!)}
        />
        <SelectBox
          label="Language"
          options={[null, ...Object.values(languages)]}
          initialOption={filters.language.value}
          onChange={(option) => (filters.language.value = option)}
        />
        <SelectBox
          label="Templates"
          options={[null, ...Object.values(templates)]}
          initialOption={filters.template.value}
          onChange={(option: any) => (filters.template.value = option)}
        />
      </div>
    </aside>
  );
}
