/**
 * t: current time（当前时间）；
 * b: beginning value（初始值）；
 * c: change in value（变化量）；
 * d: duration（持续时间）。
 */

export class mTween {

	/**
	 * 加速
	 * @param t
	 * @param b
	 * @param c
	 * @param d
	 * @returns {number}
	 */
	public static quadEaseIn(t: number, b: number, c: number, d: number): number {
		return c * (t /= d) * t + b;
	}

	/**
	 * 匀速
	 * @param t
	 * @param b
	 * @param c
	 * @param d
	 * @returns {number}
	 */
	public static quadLinear(t: number, b: number, c: number, d: number): number {
		return c * t / d + b;
	}
}