import { useState } from 'react';
import BurgBotFace from './BurgBotFace';
import { EXPRESSIONS, getExpression } from '../data/burgbotFace';

/**
 * The expression library, driveable.
 *
 * Every pose, timing curve and blend duration below is read from the robot's
 * own `expressions.py`. Picking a chip runs the same blend the 7" panel runs.
 */
const BurgBotShowcase = () => {
    const [name, setName] = useState('neutral');
    const spec = getExpression(name);

    return (
        <div className="mb-12">
            <p className="text-xs text-primary uppercase tracking-widest font-mono mb-3">
                Live in your browser
            </p>
            <h2 className="text-xl md:text-2xl font-heading font-bold text-white mb-4">
                The face
            </h2>
            <p className="text-neutral-400 leading-relaxed mb-6">
                The face is two light-blue ovals on black, with no mouth. People
                read eyes far more strongly than mouths, and a face with no mouth
                never lands in the uncanny valley of a bad one. That constraint
                forces every emotion through eye geometry, timing and motion, which
                leaves a face that is only numbers and so can be blended
                continuously between any two poses.
            </p>
            <p className="text-neutral-400 leading-relaxed mb-6">
                The panel below runs the robot's own renderer and animation layers on
                a canvas instead of pygame, using the same coordinate system, easing
                curves, blink distribution and keyframe values. Pick a pose and watch
                it blend. The eyes track your cursor for the same reason the real
                gaze layer tracks a lidar return: something is nearby, so look at it.
            </p>

            <div className="bg-surface border border-white/10 overflow-hidden">
                <div className="relative aspect-[16/9] bg-black">
                    <BurgBotFace expression={name} />
                    <p className="absolute bottom-3 right-4 text-[10px] font-mono uppercase tracking-widest text-neutral-600 pointer-events-none">
                        follows your cursor
                    </p>
                </div>

                <div className="p-5">
                    <div className="flex flex-wrap gap-2 mb-5">
                        {EXPRESSIONS.map((e) => (
                            <button
                                key={e.name}
                                onClick={() => setName(e.name)}
                                aria-pressed={e.name === name}
                                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-all ${
                                    e.name === name
                                        ? 'bg-primary border-primary text-white'
                                        : 'border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                                }`}
                            >
                                {e.name}
                            </button>
                        ))}
                    </div>

                    <div className="border-t border-white/10 pt-5">
                        <p className="text-neutral-300 leading-relaxed mb-4">{spec.note}</p>
                        <div className="flex flex-col sm:flex-row sm:items-start gap-x-8 gap-y-3">
                            <div className="flex-1">
                                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono mb-1">
                                    On the robot
                                </p>
                                <p className="text-sm text-neutral-400 leading-relaxed">
                                    {spec.trigger}
                                </p>
                            </div>
                            <div className="shrink-0">
                                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono mb-1">
                                    Timing
                                </p>
                                <p className="text-sm font-mono text-primary">
                                    {spec.blendTime.toFixed(2)}s · {spec.curve}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-sm text-neutral-500 leading-relaxed mt-4">
                How fast a face arrives at a pose is part of the pose's meaning, so
                every expression carries its own timing: startle snaps in elastically
                in 0.12&nbsp;s, melancholy seeps in over 0.55&nbsp;s. Giving every
                transition the same duration flattens all of them.
            </p>
        </div>
    );
};

export default BurgBotShowcase;
