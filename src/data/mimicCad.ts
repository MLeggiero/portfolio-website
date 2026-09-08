/**
 * CAD links and actuator media for the Mimic project page.
 *
 * Onshape sends `X-Frame-Options: SAMEORIGIN` and a CSP that only
 * allow-lists onshape.com subdomains, so its documents cannot be embedded
 * in a same-page iframe on an outside site. These link out to the real,
 * fully interactive models instead.
 */

export const FULL_ASSEMBLY_URL =
    'https://cad.onshape.com/documents/6f74789e6928968fbbcf52b6/w/efcfbf1f57de97415874b8ae/e/aa2c3d6ff899997e372c49d5?renderMode=0&uiState=6aa05270dfb63f41b0244c64';

export const ACTUATOR_URL =
    'https://cad.onshape.com/documents/4782d6ffbdcd92f25a0335be/w/bb6cb4dedfecddead55cf96d/e/23cbf11d25cdc642a7a94a7d?renderMode=0&uiState=6aa0519d2b6dfbc1c6f6d1e8';

export interface ActuatorPhoto {
    src: string;
    caption: string;
}

/**
 * Renders of the actuator built for each of the arm's three axes. The
 * source files live outside this repo — drop them in at these paths to
 * light up the actuator section on the project page.
 */
export const ACTUATOR_PHOTOS: ActuatorPhoto[] = [
    {
        src: '/images/mimic-robot-arm/actuator-cutaway.png',
        caption:
            'Section view: cross-roller bearing output stage on top, single-stage planetary gearbox and BLDC motor stack below, encoder and driver board at the base.',
    },
    {
        src: '/images/mimic-robot-arm/actuator-assembly.png',
        caption:
            'The assembled actuator housing, with the cooling fan intake visible on the side wall.',
    },
];
