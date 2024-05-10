import { YearMenu } from "./YearMenu";
import { useEffect, useState } from "react";

type Row = {
  year: string;
  month: string;
  url: string;
};

type Data = {
  [key: string]: {
    [key: string]: string;
  };
};

const rows: Row[] = [
  {
    year: "2024",
    month: "April",
    url: "https://explore.missionsq.org/realize-april2024)/p/1?_ga=2.140966834.1274526521.1715200289-1693120239.1703012616",
  },
  {
    year: "2024",
    month: "March",
    url: "https://explore.missionsq.org/realize-april2024)/p/1?_ga=2.140966834.1274526521.1715200289-1693120239.1703012616",
  },
  {
    year: "2024",
    month: "February",
    url: "https://explore.missionsq.org/realize-april2024)/p/1?_ga=2.140966834.1274526521.1715200289-1693120239.1703012616",
  },
  {
    year: "2024",
    month: "January",
    url: "https://explore.missionsq.org/realize-april2024)/p/1?_ga=2.140966834.1274526521.1715200289-1693120239.1703012616",
  },
  {
    year: "2023",
    month: "December",
    url: "https://explore.missionsq.org/realize-april2024)/p/1?_ga=2.140966834.1274526521.1715200289-1693120239.1703012616",
  },
  {
    year: "2023",
    month: "November",
    url: "https://explore.missionsq.org/realize-april2024)/p/1?_ga=2.140966834.1274526521.1715200289-1693120239.1703012616",
  },
  {
    year: "2023",
    month: "October",
    url: "https://explore.missionsq.org/realize-april2024)/p/1?_ga=2.140966834.1274526521.1715200289-1693120239.1703012616",
  },
  {
    year: "2023",
    month: "September",
    url: "https://explore.missionsq.org/realize-april2024)/p/1?_ga=2.140966834.1274526521.1715200289-1693120239.1703012616",
  },
];

function mapData(rows: Row[]) {
  const result: Data = {};
  rows.forEach((obj) => {
    result[obj.year] = result[obj.year] || {};
    result[obj.year][obj.month] = obj.url;
  });
  return result;
}

export const List = () => {
  const [data, setData] = useState<Data>();
  const [current, setCurrent] = useState<string>("Current Issue");

  useEffect(() => {
    const result = mapData(rows);
    setData(result);
  }, []);

  return (
    <>
      <div className=" bg-slate-200">
        <ul className="divide-y divide-black bg-slate-200">
          <li key={'current'}>{current}</li>
          {data &&
            Object.keys(data).map((year) => {
              return (
                <li key={`item-${year}`}>
                  <YearMenu year={year} setCurrent={setCurrent} />
                </li>
              );
            })}
        </ul>
      </div>
    </>
  );
};
