import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuSeparator,
} from "@headlessui/react";

import "./YearMenu";
import { YearMenu } from "./YearMenu";

function App() {
  return (
    <Menu>
      <MenuButton className={"w-52 bg-blue-600 text-white text-left"}>
        Previous Issues
      </MenuButton>
      <MenuItems
        className={` bg-slate-200 w-[var(--button-width)]`}
        anchor="bottom"
      >
        <MenuItem>
          <YearMenu year={"2024"} />
        </MenuItem>
        <MenuSeparator className="my-1 h-px bg-black" />
        <YearMenu year={"2023"} />
      </MenuItems>
    </Menu>
  );
}

export default App;