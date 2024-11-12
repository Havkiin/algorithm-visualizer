export type StepData = [string, number[], number[]]

export enum AnimationStepEnums {
    move = 'move',
    movePivot = 'movePivot',
    swap = 'swap',
    addLevel = 'addLevel',
    removeLevel = 'removeLevel'
}

export enum SortingAlgorithmsEnums {
    bubbleSort = 'Bubble Sort',
    insertionSort = 'Insertion Sort',
    quickSort = 'Quick Sort',
    selectionSort = 'Selection Sort'
  };

export const generateBubbleSortSteps = (input : number[]) : [StepData[], number] => {
    const newArray = [...input];
    let steps : StepData[] = [];
    let isSwapped = false;
    let comparisons = 0;

    do {
        isSwapped = false;

        for (let i = 0; i < newArray.length - 1; i++) {
            const move : StepData = [AnimationStepEnums.move, [i], []];
            steps.push(move);
            comparisons++;

            if (newArray[i] > newArray[i + 1]) {
                [newArray[i], newArray[i + 1]] = [newArray[i + 1], newArray[i]];
                const swap : StepData = [AnimationStepEnums.swap, [i, i + 1], [...newArray]];
                steps.push(swap);

                isSwapped = true;
            }
        }
    } while (isSwapped);

    return [steps, comparisons];
}

export const generateInsertionSortSteps = (input : number[]) : [StepData[], number] => {
    const newArray = [...input];
    let steps : StepData[] = []
    let comparisons = 0;

    for (let i = 1; i < newArray.length; i++) {
        const move : StepData = [AnimationStepEnums.move, [i], []];
        steps.push(move);

        for (let j = i; j > 0; j--) {
            comparisons++;

            if (newArray[j] < newArray[j - 1]) {
                [newArray[j - 1], newArray[j]] = [newArray[j], newArray[j - 1]];
                const swap : StepData = [AnimationStepEnums.swap, [j, j - 1], [...newArray]];
                steps.push(swap);
            }
            else {
                break;
            }
        }
    }

    return [steps, comparisons];
}

export const generateSelectionSortSteps = (input: number[]) : [StepData[], number] => {
    const newArray = [...input];
    let steps : StepData[] = [];
    let comparisons = 0;

    for (let i = 0; i < input.length - 1; i++) {
        let smallest = newArray[i];
        let smallestIndex = i;

        const movePivot : StepData = [AnimationStepEnums.movePivot, [i], []];
        steps.push(movePivot);

        for (let j = i; j < input.length; j++) {
            const move : StepData = [AnimationStepEnums.move, [j], []];
            steps.push(move);
            comparisons++;

            if (newArray[j] < smallest) {
                smallest = newArray[j];
                smallestIndex = j;
            }
        }

        if (smallestIndex !== i) {
            [newArray[i], newArray[smallestIndex]] = [newArray[smallestIndex], newArray[i]];
            const swap : StepData = [AnimationStepEnums.swap, [smallestIndex, i], [...newArray]];
            steps.push(swap);
            const moveNull : StepData = [AnimationStepEnums.move, [], []]
            steps.push(moveNull);
        }
    }

    return [steps, comparisons];
}

export const generateQuickSortSteps = (input: number[], levelIndex : number) : [StepData[], number, number[]] => {
    let steps : StepData[] = [];
    let comparisons = 0;
    
    if (input.length < 2) {
        const emptyStep : StepData = ['', [], []];
        return [[emptyStep], comparisons, input];
    }

    const newArray = [...input];
    let pIndex = newArray.length - 1;
    const movePivot : StepData = [AnimationStepEnums.movePivot, [pIndex], []];
    steps.push(movePivot);

    for (let i = 0; i < pIndex; i++) {
        const move : StepData = [AnimationStepEnums.move, [i], []];
        steps.push(move);
        comparisons++;

        while (newArray[i] >= newArray[pIndex] && i < pIndex) {
            const move2 : StepData = [AnimationStepEnums.move, [i], []];
            steps.push(move2);
            comparisons++;

            [newArray[pIndex - 1], newArray[pIndex]] = [newArray[pIndex], newArray[pIndex - 1]];
            const swap : StepData = [AnimationStepEnums.swap, [pIndex - 1, pIndex], [...newArray]];
            steps.push(swap);
            const moveNull : StepData = [AnimationStepEnums.move, [], []];
            steps.push(moveNull);
            
            pIndex = pIndex - 1;
            const movePivot2 : StepData = [AnimationStepEnums.movePivot, [pIndex], []];
            steps.push(movePivot2);
            
            if (i < pIndex) {
                [newArray[i], newArray[pIndex + 1]] = [newArray[pIndex + 1], newArray[i]];
                const swap2 : StepData = [AnimationStepEnums.swap, [i, pIndex + 1], [...newArray]];
                steps.push(swap2);
            }
        }
    }

    // Get recursive
    const leftArray = newArray.slice(0, pIndex);
    const rightArray = newArray.slice(pIndex + 1);
    
    // Left side
    const addLevelL : StepData = [AnimationStepEnums.addLevel, [levelIndex + 1, 0, pIndex - 1], [...leftArray]];
    steps.push(addLevelL);

    const [subStepsL, comparisonsL, leftArr] = generateQuickSortSteps(leftArray, levelIndex + 1);
    subStepsL.forEach((s) => {
        steps.push(s);
    });

    const removeLevelL : StepData = [AnimationStepEnums.removeLevel, [levelIndex + 1], [...leftArr, newArray[pIndex], ...rightArray]];
    steps.push(removeLevelL);
    comparisons += comparisonsL;

    // Right side
    const addLevelR : StepData = [AnimationStepEnums.addLevel, [levelIndex + 1, pIndex + 1, newArray.length - 1], [...rightArray]];
    steps.push(addLevelR);

    const [subStepsR, comparisonsR, rightArr] = generateQuickSortSteps(rightArray, levelIndex + 1);
    subStepsR.forEach((s) => {
        steps.push(s);
    });

    const removeLevelR : StepData = [AnimationStepEnums.removeLevel, [levelIndex + 1], [...leftArr, newArray[pIndex], ...rightArr]];
    steps.push(removeLevelR);
    comparisons += comparisonsR;

    // Final array
    const finalArray = [...leftArr, newArray[pIndex], ...rightArr];

    return [steps, comparisons, finalArray];
  }