/**
 * Media that the generic project page cannot show well: the demo animation is
 * a wide side-by-side strip and the pipeline diagram is a wide flowchart, so
 * both would be cropped to nothing as 4:3 gallery thumbnails. They get the
 * full content width here instead.
 */

const HARDWARE: { block: string; implementation: string }[] = [
    { block: 'Controller', implementation: 'Seeed XIAO RP2350, 12-bit ADC, USB-C' },
    { block: 'Row drive', implementation: '4 x SN74LVC595A, 32 actively driven rows' },
    { block: 'Column readout', implementation: '2 x CD74HC4067, 32 columns across two ADC banks' },
    { block: 'Analog front end', implementation: '3.3 kΩ sense pulldowns and TLV9062 unity-gain buffers' },
    { block: 'Sensor interface', implementation: 'Two 32-way, 0.5 mm FFC connectors' },
    { block: 'PCB', implementation: 'Four layers with dedicated ground and power planes' },
];

const TaxelScanShowcase = () => {
    return (
        <div className="mb-12">
            {/* Demo animation, front and center */}
            <div className="mb-12">
                <p className="text-xs text-primary uppercase tracking-widest font-mono mb-3">
                    Live
                </p>
                <figure className="bg-surface border border-white/10">
                    <img
                        src="/images/taxelscan/demo.webp"
                        alt="A hand presses the tactile sensor beside its synchronized live pressure map"
                        className="w-full"
                    />
                    <figcaption className="p-3 text-xs text-neutral-500 leading-relaxed">
                        A hand on the sensor and the live pressure map from the reader board,
                        recorded together. Each finger resolves to its own contact.
                    </figcaption>
                </figure>
            </div>

            {/* Hardware spec table */}
            <div className="mb-12">
                <h2 className="text-xl md:text-2xl font-heading font-bold text-white mb-4">
                    Hardware
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-white/10">
                        <tbody>
                            {HARDWARE.map((row) => (
                                <tr key={row.block} className="border-b border-white/10 last:border-b-0">
                                    <th
                                        scope="row"
                                        className="text-left align-top whitespace-nowrap px-4 py-3 bg-surface
                                                   text-xs text-primary uppercase tracking-widest font-mono font-normal"
                                    >
                                        {row.block}
                                    </th>
                                    <td className="px-4 py-3 text-neutral-400 leading-relaxed">
                                        {row.implementation}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pipeline diagram */}
            <div>
                <h2 className="text-xl md:text-2xl font-heading font-bold text-white mb-4">
                    The pipeline
                </h2>
                <p className="text-neutral-400 leading-relaxed mb-5">
                    Ten stages split across the RP2350's two cores. Core 1 owns
                    acquisition on a fixed deadline. Core 0 owns everything that turns raw
                    counts into a pressure map and a contact list.
                </p>
                <figure className="bg-white border border-white/10">
                    <img
                        src="/images/taxelscan/signal-conditioning.svg"
                        alt="Flowchart of the ten-stage TaxelScan acquisition and signal-conditioning pipeline"
                        className="w-full"
                        loading="lazy"
                    />
                </figure>
            </div>
        </div>
    );
};

export default TaxelScanShowcase;
