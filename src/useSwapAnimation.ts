import { useRef } from 'react';

export function useSwapAnimation () {
    const elementRefs = useRef<(HTMLInputElement | null)[][]>([[]]);
    
    async function animateSwap (index1 : number, index2 : number, levelIndex : number, animationTime : number) {
        const el1 = elementRefs.current[levelIndex][index1];
        const el2 = elementRefs.current[levelIndex][index2];
        if (el1 && el2) {
        el1.style.transition = `transform ${animationTime / 1000}s`;
        el2.style.transition = `transform ${animationTime / 1000}s`;

        const rect1 = el1.getBoundingClientRect();
        const rect2 = el2.getBoundingClientRect();
        const deltaX = rect2.left - rect1.left;
        const deltaY = rect2.top - rect1.top;

        el1.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        el2.style.transform = `translate(${-deltaX}px, ${-deltaY}px)`;

        await new Promise(resolve => setTimeout(resolve, animationTime));

        el1.style.transition = 'none';
        el2.style.transition = 'none';
        el1.style.transform = '';
        el2.style.transform = '';
        }
    }

    return { elementRefs, animateSwap };
}