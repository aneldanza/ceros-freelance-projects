export const fields = [
  "Fuse Type",
  "Fuse Style",
  "Fuse Holder Voltage",
  "Fuse Holder Amps",
  "Fuse Holder Position",
  "Fuse Holder Style",
  "Fuse Holder Mounting Method",
  "Environmental Protection",
  "part",
];

export const maskingStrategyQuestions = [
  "Fuse Holder Position",
  "Fuse Holder Style",
  "Fuse Holder Mounting Method",
  "Environmental Protection",
];

export const hidingStrategyQuestions = [
  "Fuse Holder Voltage",
  "Fuse Holder Amps",
];

export const pathMap: Record<string, string> = {
  "Fuse Type": "Fuse Type: {{}}",
  "Fuse Style": "Fuse Style: {{}}",
  "Fuse Holder Voltage": "Volts: {{}}V DC",
  "Fuse Holder Amps": "Amps: {{}}A",
  "Fuse Holder Position": "Fuse Holder Position: {{}}",
  "Fuse Holder Style": "Fuse Holder Style: {{}}",
  "Fuse Holder Mounting Method": "Mounting: {{}}",
  "Environmental Protection": "Protecttion: {{}}",
};

export const OPTION = "answer";
export const QUESTION = "q";
export const DELIMETER = ":";
export const SPECS = "specs";
export const DESCRIPTION = "description";
export const PATH = "path";
