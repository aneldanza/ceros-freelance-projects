import { Node } from "../Node";
import { QuestionStrategy } from "./QuestionStrategy";

export class SliderOptionsStrategy extends QuestionStrategy {
  displayAnswerOptions(node: Node): void {
    const sliderValues = node.children.map((node) => Number(node.value));

    const interval = setInterval(() => {
      const sliderContainer = document.getElementById(
        "slider-container"
      ) as HTMLInputElement;
      const output = document.getElementById("slider-value");

      if (sliderContainer && output) {
        clearInterval(interval);

        if (sliderValues.length > 1) {
          if (!sliderContainer.querySelector("#customSlider")) {
            const slider = this.createSlider(sliderValues.length - 1);

            sliderContainer.prepend(slider);

            slider.addEventListener("input", () => {
              const index = parseInt(slider.value, 10);
              // output.textContent = `${sliderValues[index]}`;
              this.updateSliderBackground(index, sliderValues, slider);
              this.updateSliderValuePosition(
                sliderValues,
                output,
                index,
                slider
              );
            });

            this.updateSliderBackground(0, sliderValues, slider);
            this.updateSliderValuePosition(sliderValues, output, 0, slider);
          }
        }

        // Initial state
        output.textContent = `${sliderValues[0]}`;
      }
    }, 200);
  }

  updateSliderValuePosition(
    sliderValues: number[],
    valueDisplay: HTMLElement,
    index: number,
    slider: HTMLInputElement
  ) {
    const percent = index / (sliderValues.length - 1);

    const sliderWidth = slider.offsetWidth;
    const thumbWidth = 32;
    const sliderLeft = slider.offsetLeft;

    // Calculate thumb position within slider
    const thumbX = percent * (sliderWidth - thumbWidth) + thumbWidth / 2;

    // Position the value element
    valueDisplay.style.left = `${sliderLeft + thumbX}px`;
    valueDisplay.textContent = sliderValues[index].toString();
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
  updateSliderBackground(
    index: number,
    sliderValues: number[],
    slider: HTMLElement
  ) {
    const percent = (index / (sliderValues.length - 1)) * 100;
    const trackStyle = `linear-gradient(to right, #008752 0%, #008752 ${percent}%, #ccc ${percent}%, #ccc 100%)`;
    slider.style.background = trackStyle;
  }
}
