import { ANIM } from '../config';
import { pending } from '../core/todo';

/** Pricing Monthly/Yearly switch: knob slide + track colour (spring 0.4 s); labels/state in React. */
export function pricingSwitch(knob: HTMLElement, track: HTMLElement, on: boolean, cfg = ANIM.pricing) {
  void knob; void track; void on; void cfg;
  pending('pricing', 'switch');
}
