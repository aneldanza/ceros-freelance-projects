import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  CloseButton,
  MenuSeparator,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

interface YearMenuProps {
  year: string;
  setCurrent: React.Dispatch<React.SetStateAction<string>>;
}

const months = [
  {
    label: "Jan",
    url: "/jan",
  },
  {
    label: "Feb",
    url: "/Feb",
  },
  {
    label: "March",
    url: "/March",
  },
  {
    label: "April",
    url: "/April",
  },
  {
    label: "May",
    url: "/May",
  },
  {
    label: "June",
    url: "/June",
  },
  {
    label: "July",
    url: "/July",
  },
  {
    label: "August",
    url: "/August",
  },
  {
    label: "September",
    url: "/September",
  },
  {
    label: "October",
    url: "/October",
  },
  {
    label: "November",
    url: "/November",
  },
  {
    label: "December",
    url: "/December",
  },
];
export const YearMenu: React.FC<YearMenuProps> = ({ year, setCurrent }) => {
  const handlePanelClick = (label: string) => {
    console.log("clicked panel");
    console.log(label);
    setCurrent(`${label} ${year}`);
  };
  return (
    <Disclosure>
      <DisclosureButton className={"group flex items-center gap-2"}>
        {year}
        <ChevronDownIcon className="w-5 group-data-[open]:rotate-180" />
      </DisclosureButton>
      {months.map((month) => {
        return (
          <DisclosurePanel key={`item-${month.label}`} className={"text-white"}>
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
