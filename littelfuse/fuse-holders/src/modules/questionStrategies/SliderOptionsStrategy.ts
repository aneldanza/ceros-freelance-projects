import { Node } from "../Node";
import { Observable } from "../Observer";
import { QuestionStrategy } from "./QuestionStrategy";

export class SliderOptionsStrategy extends QuestionStrategy {
  private currentIndex: Observable<number>;
  private nextButtonMask: CerosLayerCollection;
  public sliderValues: Observable<number[]>;
  private sliderContainer: HTMLInputElement | null;
  private output: HTMLElement | null;
  public slider: HTMLInputElement | null;

  constructor(name: string, experience: Experience) {
    super(name, experience);
    this.currentIndex = new Observable(0);
    this.sliderValues = new Observable([0]);
    this.nextButtonMask = experience.findLayersByTag(`${name}-mask`);
    this.sliderContainer = document.getElementById(
      "slider-container"
    ) as HTMLInputElement;
    this.output = document.getElementById("slider-value");
    this.slider = null;

    this.currentIndex.subscribe((index) => {
      if (index > 0) {
        this.nextButtonMask.hide();
      } else {
        this.nextButtonMask.show();
      }
    });
  }

  reset() {
    this.currentIndex.value = 0;
    this.sliderValues.value = [];
  }

  getSliderContainer() {
    return this.sliderContainer;
  }

  getOutput() {
    return this.output;
  }

  displayAnswerOptions(node: Node): void {
    const nodeValues = node.children.map((node) => Number(node.value));
    this.sliderValues.value = [0, ...nodeValues];
    console.log(this.sliderValues.value);

    if (this.sliderContainer && this.output) {
      this.displayOutput(nodeValues, this.sliderContainer, this.output);
    } else {
      const interval = setInterval(() => {
        const sliderContainer = document.getElementById(
          "slider-container"
        ) as HTMLInputElement;
        const output = document.getElementById("slider-value");

        if (sliderContainer && output) {
          clearInterval(interval);

          this.sliderContainer = sliderContainer;
          this.output = output;

          this.displayOutput(nodeValues, this.sliderContainer, this.output);
        }
      }, 200);
    }
  }

  displayOutput(
    nodeValues: number[],
    sliderContainer: HTMLInputElement,
    output: HTMLElement
  ) {
    if (nodeValues.length > 1) {
      // if (!sliderContainer.querySelector("#customSlider")) {
      this.displaySlider(sliderContainer, output);
      if (this.slider) {
        this.slider.style.display = "block";
      }
      // }
    } else {
      if (this.slider) {
        this.slider.style.display = "none";
      }

      this.displaySingleOption(output, nodeValues);
    }
  }

  displaySingleOption(output: HTMLElement, nodeValues: number[]) {
    output.style.fontSize = "45px";
    output.style.fontWeight = "bold";
    output.style.color = "#707070";
    output.style.left = "50%";
    // Initial state
    output.textContent = `${nodeValues[0]}`;
  }

  displaySlider(sliderContainer: HTMLElement, output: HTMLElement) {
    if (!this.slider) {
      this.registerNewSlider(sliderContainer, output);
    } else {
      this.slider.max = (this.sliderValues.value.length - 1).toString();
      this.slider.value = "0";
      this.updateSliderBackground(this.slider);
      this.updateSliderValuePosition(output, this.slider);
    }
  }

  registerNewSlider(sliderContainer: HTMLElement, output: HTMLElement) {
    const slider = this.getSlider(sliderContainer) as HTMLInputElement;
    this.slider = slider;

    this.slider.addEventListener("input", (event) => {
      const target = event.target as HTMLInputElement;

      // Ensure target is valid and the value is a number
      if (target && !isNaN(Number(target.value))) {
        this.currentIndex.value = parseInt(target.value, 10);

        // Update slider background and value position
        this.updateSliderBackground(target);
        this.updateSliderValuePosition(output, target);
      }
    });

    this.updateSliderBackground(this.slider);
    this.updateSliderValuePosition(output, this.slider);
  }

  updateSliderValuePosition(
    valueDisplay: HTMLElement,
    slider: HTMLInputElement
  ) {
    console.log(`index: ${this.currentIndex.value}`);
    console.log(`value: ${this.sliderValues.value[this.currentIndex.value]}`);
    const percent =
      this.currentIndex.value / (this.sliderValues.value.length - 1);

    const sliderWidth = slider.offsetWidth;
    const thumbWidth = 32;
    const sliderLeft = slider.offsetLeft;

    // Calculate thumb position within slider
    const thumbX = percent * (sliderWidth - thumbWidth) + thumbWidth / 2;

    // Position the value element
    valueDisplay.style.left = `${sliderLeft + thumbX}px`;
    valueDisplay.textContent =
      this.currentIndex.value === 0
        ? ""
        : `${this.sliderValues.value[this.currentIndex.value]}A`;
  }

  getSlider(sliderContainer: HTMLElement) {
    const slider = sliderContainer.querySelector("#customSlider");
    if (!slider) {
      const newSlider = this.createSlider(this.sliderValues.value.length - 1);
      sliderContainer.prepend(newSlider);
      return newSlider;
    } else {
      return slider as HTMLInputElement;
    }
  }

  createSlider(size: number) {
    const slider = document.createElement("input");
    slider.type = "range";
    slider.id = "customSlider";
    slider.min = "0";
    slider.max = size.toString();
    slider.value = "0";

    return slider;
  }
  updateSliderBackground(slider: HTMLElement) {
    const percent =
      (this.currentIndex.value / (this.sliderValues.value.length - 1)) * 100;
    const trackStyle = `linear-gradient(to right, #008752 0%, #008752 ${percent}%, #ccc ${percent}%, #ccc 100%)`;
    slider.style.background = trackStyle;
  }
}
