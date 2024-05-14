import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  CloseButton,
  MenuSeparator,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { MonthData, PanelData } from "./types";

interface YearMenuProps {
  year: string;
  setCurrent: React.Dispatch<React.SetStateAction<string>>;
  months: MonthData[];
  togglePanels(newPanel: PanelData): void;
}

export const YearMenu: React.FC<YearMenuProps> = ({
  year,
  setCurrent,
  months,
  togglePanels,
}) => {
  const handlePanelClick = (label: string) => {
    setCurrent(`${label} ${year}`);
  };

  const handleDisclosureClick = (panel: PanelData) => {
    if (!panel.open) {
      // On the first click, the panel is opened but the "open" prop's value is still false. Therefore the falsey verification
      // This will make so the panel close itself when we click it while open
      panel.close();
    }

    // Now we call the function to close the other opened panels (if any)
    togglePanels({ ...panel, key: year });
  };

  return (
    <Disclosure as="li" className={"p-2"}>
      {(panel) => {
        return (
          <>
            <DisclosureButton
              className={"group flex items-center gap-2 text-white"}
              onClick={() => {
                handleDisclosureClick({ ...panel, key: year });
              }}
            >
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
                  <CloseButton
                    onClick={() => {
                      handlePanelClick(month.label);
                    }}
                  >
                    {month.label}
                  </CloseButton>
                </DisclosurePanel>
              );
            })}
          </>
        );
      }}
    </Disclosure>
  );
};
