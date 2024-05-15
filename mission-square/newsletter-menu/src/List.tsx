import { useEffect, useState } from "react";
import { usePapaParse } from "react-papaparse";
import { type Row, Data, MonthData, PanelData } from "./types";
import { YearMenu } from "./YearMenu";

function mapData(rows: Row[]) {
  const result: Data = {};
  rows.forEach((obj: Row) => {
    result[obj.year] = result[obj.year] || {};
    result[obj.year].months = result[obj.year].months || [];

    const monthObj: MonthData = {
      label: obj.month,
      url: obj.url,
    };

    result[obj.year].months.push(monthObj);
  });
  return result;
}

const link: string =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS5dslnjB6l5rk9gqR-5v-kL0bOSReczrPAZb-JnRzp24u7v1AZZuxoZPEvisgR-ZCIG_veGTSSGr40/pub?gid=0&single=true&output=csv";

export const List = () => {
  const [data, setData] = useState<Data>();
  const [years, setYears] = useState<string[]>([]);
  const [current, setCurrent] = useState<string>("Current Issue");
  const { readRemoteFile } = usePapaParse();
  const [activeDisclosurePanel, setActiveDisclosurePanel] =
    useState<PanelData>();

  function togglePanels(newPanel: PanelData) {
    if (activeDisclosurePanel) {
      if (
        activeDisclosurePanel.key !== newPanel.key &&
        activeDisclosurePanel.open
      ) {
        activeDisclosurePanel.close();
      }
    }

    setActiveDisclosurePanel({
      ...newPanel,
      open: !newPanel.open,
    });
  }

  useEffect(() => {
    readRemoteFile(link, {
      header: true,
      download: true,
      complete: (rows: { data: Row[] }) => {
        const result = mapData(rows.data);
        setData(result);
        setYears(Object.keys(result).sort((a, b) => Number(b) - Number(a)));
      },
    });
  }, [readRemoteFile]);

  return (
    <>
      <div className=" bg-primary font-body border-2 border-white border-t-0">
        <ul className="divide-y divide-white">
          <li className="text-secondary font-bold p-2" key={"current"}>
            {current}
          </li>
          {data &&
            years.map((year) => {
              return (
                <YearMenu
                  key={`${year}`}
                  togglePanels={togglePanels}
                  year={year}
                  setCurrent={setCurrent}
                  months={data[year].months}
                />
              );
            })}
        </ul>
      </div>
    </>
  );
};
