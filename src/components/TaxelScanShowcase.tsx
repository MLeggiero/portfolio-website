/**
 * Media that the generic project page cannot show well: the demo animation is
 * a wide side-by-side strip and the pipeline diagram is a wide flowchart, so
 * both would be cropped to nothing as 4:3 gallery thumbnails. They get the
 * full content width here instead.
 *
 * REV4 is designed but not built and REV1 is measured hardware, so anything
 * here that quotes a number has to say which board it belongs to.
 */

const REPO = 'https://github.com/MLeggiero/taxelscan';

const COMPARISON: { block: string; rev1: string; rev4: string }[] = [
    { block: 'Status', rev1: 'Built and measured', rev4: 'Designed, not yet built' },
    { block: 'Sensor', rev1: '16 x 32 Velostat, 512 taxels', rev4: '32 x 32 carbon nanotube, 1,024 taxels' },
    { block: 'Scale', rev1: 'One board', rev4: 'Eight boards, 8,192 taxels' },
    { block: 'Controller', rev1: 'XIAO RP2350 module', rev4: 'RP2354A on the board' },
    { block: 'Readout', rev1: '4 x SN74LVC595A, 2 x CD74HC4067', rev4: 'Same' },
    { block: 'Front end', rev1: '3.3 kΩ, unity-gain TLV9062', rev4: '10 kΩ, TLV9062 at a gain of 6' },
    { block: 'Host link', rev1: 'USB-C', rev4: 'USB-C, RS-485 between boards' },
    { block: 'Frame rate', rev1: '200 fps at 512 taxels, 500 Hz downscaled', rev4: '60 Hz target (predicted)' },
    { block: 'PCB', rev1: 'Four layers', rev4: 'Four layers, 60.3 x 35.9 mm' },
];

const TaxelScanShowcase = () => {
    return (
        <div className="mb-12">
            {/* REV4 board and its status */}
            <div className="mb-12">
                <p className="text-xs text-primary uppercase tracking-widest font-mono mb-3">
                    REV4
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10">
                    <figure className="bg-surface p-4">
                        <img
                            src="/images/taxelscan/rev4-top.png"
                            alt="Top view of the TaxelScan REV4 board, with two FFC connectors along the top edge, the RP2354A in the center, and the USB-C and harness connectors along the bottom"
                            className="w-full"
                        />
                    </figure>
                    <figure className="bg-surface p-4">
                        <img
                            src="/images/taxelscan/rev4-bottom.png"
                            alt="Bottom view of the TaxelScan REV4 board, all routing and vias with no parts"
                            className="w-full"
                            loading="lazy"
                        />
                    </figure>
                </div>
                <p className="mt-4 p-4 border border-white/10 text-sm text-neutral-400 leading-relaxed">
                    <span className="text-white font-bold">Status: </span>
                    ready to fabricate, not yet built, firmware not written. REV4 numbers are
                    design values, not measurements.
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
                    <a
                        href={`${REPO}/tree/rev4`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-white transition-colors"
                    >
                        REV4 on GitHub
                    </a>
                    <a
                        href={REPO}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-white transition-colors"
                    >
                        REV1 on GitHub
                    </a>
                </div>
            </div>

            {/* REV1 against REV4 */}
            <div className="mb-12">
                <h2 className="text-xl md:text-2xl font-heading font-bold text-white mb-4">
                    Hardware
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-white/10">
                        <thead>
                            <tr className="border-b border-white/10 bg-surface">
                                <td className="px-4 py-3" />
                                <th scope="col" className="text-left px-4 py-3 text-white font-bold">REV1</th>
                                <th scope="col" className="text-left px-4 py-3 text-white font-bold">REV4</th>
                            </tr>
                        </thead>
                        <tbody>
                            {COMPARISON.map((row) => (
                                <tr key={row.block} className="border-b border-white/10 last:border-b-0">
                                    <th
                                        scope="row"
                                        className="text-left align-top whitespace-nowrap px-4 py-3 bg-surface
                                                   text-xs text-primary uppercase tracking-widest font-mono font-normal"
                                    >
                                        {row.block}
                                    </th>
                                    <td className="px-4 py-3 text-neutral-400 leading-relaxed align-top">
                                        {row.rev1}
                                    </td>
                                    <td className="px-4 py-3 text-neutral-400 leading-relaxed align-top">
                                        {row.rev4}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Demo animation */}
            <div className="mb-12">
                <p className="text-xs text-primary uppercase tracking-widest font-mono mb-3">
                    Live on REV1
                </p>
                <figure className="bg-surface border border-white/10">
                    <img
                        src="/images/taxelscan/demo.webp"
                        alt="A hand presses the tactile sensor beside its synchronized live pressure map"
                        className="w-full"
                        loading="lazy"
                    />
                    <figcaption className="p-3 text-xs text-neutral-500 leading-relaxed">
                        Each finger resolves to its own contact.
                    </figcaption>
                </figure>
            </div>

            {/* Pipeline diagram */}
            <div>
                <h2 className="text-xl md:text-2xl font-heading font-bold text-white mb-4">
                    The pipeline
                </h2>
                <p className="text-neutral-400 leading-relaxed mb-5">
                    Ten stages across two cores, running on REV1. REV4 is planned to reuse it.
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
