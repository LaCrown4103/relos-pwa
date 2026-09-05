interface SectionLabelProps {
  index: number;
  label: string;
}

export const SectionLabel = ({ index, label }: SectionLabelProps) => (
  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
    <span className="text-couple-secondary">Teil {index}</span>
    <span className="mx-2 text-gray-300">|</span>
    {label}
  </p>
);
