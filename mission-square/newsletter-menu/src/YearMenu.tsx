import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  CloseButton,
  MenuSeparator,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { MonthData } from "./types";

interface YearMenuProps {
  year: string;
  setCurrent: React.Dispatch<React.SetStateAction<string>>;
  months: MonthData[];
}

export const YearMenu: React.FC<YearMenuProps> = ({
  year,
  setCurrent,
  months,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePanelClick = (label: any) => {
    console.log("clicked panel");
    console.log(label);
    setCurrent(`${label} ${year}`);
  };
  return (
    <Disclosure>
      <DisclosureButton className={"group flex items-center gap-2 text-white"}>
        {year}
        <ChevronDownIcon className="w-5 group-data-[open]:rotate-180" />
      </DisclosureButton>
      {months.map((month: MonthData) => {
        return (
          <DisclosurePanel
            key={`item-${month.label}-${year}`}
            className={"text-white"}
          >
            <MenuSeparator className="my-1 h-px bg-white" />
            <CloseButton onClick={handlePanelClick.bind(this, month.label)}>
              {month.label}
            </CloseButton>
          </DisclosurePanel>
        );
      })}
    </Disclosure>
  );
};
