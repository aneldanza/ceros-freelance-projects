import { Node } from "../lib/Node";
import { Observable } from "../Observer";
import { QuestionStrategy } from "./QuestionStrategy";

export class SliderOptionsStrategy extends QuestionStrategy {
  private currentIndex: Observable<number>;
  private nextButtonMask: CerosLayerCollection;
  private sliderValues: number[];
  private sliderContainer: HTMLInputElement | null;
  private output: HTMLElement | null;
  public slider: HTMLInputElement | null;

  constructor(name: string, experience: Experience, CerosSDK: CerosSDK) {
    super(name, experience, CerosSDK);

    this.currentIndex = new Observable(0);
    this.sliderValues = [];
    this.nextButtonMask = experience.findLayersByTag(`${name}-mask`);
    this.sliderContainer = document.getElementById(
      "slider-container"
    ) as HTMLInputElement;
    this.output = document.getElementById("slider-value");
    this.slider = null;

    this.registerCerosEvents();
    this.subscribeToObservables();
  }

  subscribeToObservables() {
    this.currentIndex.subscribe(this.handleNextButtonDisplay.bind(this));
    this.currentIndex.subscribe(this.updateSliderBackground.bind(this));
    this.currentIndex.subscribe(this.updateSliderValuePosition.bind(this));
  }

  registerCerosEvents() {
    this.optionsCollection.on(
      this.CerosSDK.EVENTS.CLICKED,
      this.handleOptionClick.bind(this)
    );
  }

  handleNextButtonDisplay(index: number) {
    if (index > 0) {
      this.nextButtonMask.hide();
    } else {
      this.nextButtonMask.show();
    }
  }

  handleOptionClick(_: CerosComponent): void {
    const answer = this.sliderValues[this.currentIndex.value].toString();

    const array = this.selectedOption.value.split(":");
    array[1] = this.key;
    array[2] = answer;

    this.selectedOption.value = array.join(":");
  }

  getSliderContainer() {
    return this.sliderContainer;
  }

  getOutput() {
    return this.output;
  }

  displayAnswerOptions(node: Node): void {
    const nodeValues = node.children.map((node) => Number(node.value));

    if (this.slider) {
      this.slider.remove();
      this.slider = null;
    }

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
      this.displaySlider(sliderContainer, output, nodeValues);
      if (this.slider) {
        this.currentIndex.value = 0;
        this.slider.style.display = "block";
      }
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

  displaySlider(
    sliderContainer: HTMLElement,
    output: HTMLElement,
    nodeValues: number[]
  ) {
    this.sliderValues = [0, ...nodeValues];
    console.log(this.sliderValues);

    this.registerNewSlider(sliderContainer, output);
  }

  registerNewSlider(sliderContainer: HTMLElement, output: HTMLElement) {
    const slider = this.getSlider(sliderContainer) as HTMLInputElement;
    this.slider = slider;

    this.slider.addEventListener("input", (event) => {
      const target = event.target as HTMLInputElement;

      // Ensure target is valid and the value is a number
      if (target && !isNaN(Number(target.value))) {
        this.currentIndex.value = parseInt(target.value, 10);
      }
    });
  }

  updateSliderValuePosition() {
    console.log(`index: ${this.currentIndex.value}`);
    console.log(`value: ${this.sliderValues[this.currentIndex.value]}`);

    if (this.slider && this.output) {
      const percent = this.currentIndex.value / (this.sliderValues.length - 1);

      const sliderWidth = this.slider.offsetWidth;
      const thumbWidth = 32;
      const sliderLeft = this.slider.offsetLeft;

      // Calculate thumb position within slider
      const thumbX = percent * (sliderWidth - thumbWidth) + thumbWidth / 2;

      // Position the value element
      this.output.style.left = `${sliderLeft + thumbX}px`;
      this.output.textContent =
        this.currentIndex.value === 0
          ? ""
          : `${this.sliderValues[this.currentIndex.value]}A`;
    }
  }

  updateSliderBackground() {
    if (this.slider) {
      const percent =
        (this.currentIndex.value / (this.sliderValues.length - 1)) * 100;
      const trackStyle = `linear-gradient(to right, #008752 0%, #008752 ${percent}%, #ccc ${percent}%, #ccc 100%)`;
      this.slider.style.background = trackStyle;
    }
  }

  getSlider(sliderContainer: HTMLElement) {
    const slider = sliderContainer.querySelector("#customSlider");
    if (!slider) {
      const newSlider = this.createSlider(this.sliderValues.length - 1);
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
}
