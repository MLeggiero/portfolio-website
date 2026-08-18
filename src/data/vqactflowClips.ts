export const VQ_BASE = 'https://vqactflow.github.io/vqactflow';
export const VQ_ARXIV = 'https://arxiv.org/abs/2606.21600';

export interface Clip {
    label: string;
    caption: string;
    video: string;
    poster: string;
}

export const clipGroups: { name: string; blurb: string; clips: Clip[] }[] = [
    {
        name: 'Unitree G1 Humanoid',
        blurb: 'Language-conditioned pick-and-place on real humanoid hardware. Four objects, one policy.',
        clips: [
            { label: 'Red ball', caption: 'Place the red ball into the box', video: 'g1_ball', poster: 'g1_ball' },
            { label: 'Cup', caption: 'Place the cup into the box', video: 'g1_cup', poster: 'g1_cup' },
            { label: 'Bottle', caption: 'Place the bottle into the box', video: 'g1_bottle', poster: 'g1_bottle' },
            { label: 'Medicine', caption: 'Place the medicine bottle into the box', video: 'g1_medicine', poster: 'g1_medicine' },
        ],
    },
    {
        name: 'Bimanual Platform',
        blurb: 'ALOHA-style two-arm manipulation: sweeping, sorting, and insertion from a single multi-task policy.',
        clips: [
            { label: 'Battery sweep', caption: 'Sweep the battery into the dust pan', video: 'bimanual_sweep', poster: 'bimanual_sweep' },
            { label: 'Rubber duck', caption: 'Place the rubber duck into the white bin', video: 'bimanual_duck', poster: 'bimanual_duck' },
            { label: 'Cylinder', caption: 'Insert the cylinder into the hole', video: 'bimanual_cylinder', poster: 'bimanual_cylinder' },
            { label: 'Red ball', caption: 'Place the red ball into the black bin', video: 'bimanual_ball', poster: 'bimanual_ball' },
        ],
    },
];
