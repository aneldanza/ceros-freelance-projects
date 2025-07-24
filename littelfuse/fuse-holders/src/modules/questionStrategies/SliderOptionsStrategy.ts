import { Node } from "../Node";
import { QuestionStrategy } from "./QuestionStrategy";

export class SliderOptionsStrategy extends QuestionStrategy {
  displayAnswerOptions(node: Node): void {
    const sliderValues = [
      0.5, 1.5, 2.25, 3, 3.75, 5.5, 7.5, 12, 15, 19, 23, 26, 30, 38, 45, 53, 60,
      75, 94, 113, 131, 150, 169, 188, 206, 225, 263, 300, 319, 338, 375, 450,
      488,
    ];

    const interval = setInterval(() => {
      const slider = document.getElementById(
        "customSlider"
      ) as HTMLInputElement;
      const output = document.getElementById("slider-value");

      if (slider && output) {
        clearInterval(interval);
        slider.addEventListener("input", () => {
          const index = parseInt(slider.value, 10);
          output.textContent = `Selected: ${sliderValues[index]}`;
          this.updateSliderBackground(index, sliderValues, slider);
        });

        // Initial state
        output.textContent = `Selected: ${sliderValues[0]}`;
        this.updateSliderBackground(0, sliderValues, slider);
      }
    }, 200);
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
