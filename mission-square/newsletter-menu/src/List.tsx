import { YearMenu } from "./YearMenu";
import { useEffect, useState } from "react";
import { usePapaParse } from "react-papaparse";
import { type Row, Data, MonthData } from "./types";

function mapData(rows: unknown) {
  const result: Data = {};
  rows.forEach((obj: Row) => {
    result[obj.year] = result[obj.year] || {};
    result[obj.year].months = result[obj.year].months || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const [current, setCurrent] = useState<string>("Current Issue");
  const { readRemoteFile } = usePapaParse();

  useEffect(() => {
    readRemoteFile(link, {
      header: true,
      download: true,
      complete: (rows) => {
        const result = mapData(rows.data);
        console.log(result);
        setData(result);
      },
    });
  }, []);

  return (
    <>
      <div className=" bg-slate-200">
        <ul className="divide-y divide-black bg-slate-200">
          <li key={"current"}>{current}</li>
          {data &&
            Object.keys(data).map((year) => {
              return (
                <li key={`item-${year}`}>
                  <YearMenu
                    year={year}
                    setCurrent={setCurrent}
                    months={data[year].months}
                  />
                </li>
              );
            })}
        </ul>
      </div>
    </>
  );
};
