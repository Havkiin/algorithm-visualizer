import React, { useEffect, useState, useRef } from 'react'
import { useSwapAnimation } from './useSwapAnimation';
import  * as SortingAlgorithms from './sortingAlgorithms';
import './algorithmVisualizer.css'

const MAX_ELEMENTS = 10;
const MIN_VALUE = 0;
const MAX_VALUE = 99;

const DEFAULT_SPEED = 300;

const sortingAlgorithmsList = Object.values(SortingAlgorithms.SortingAlgorithmsEnums);

export const AlgorithmVisualizer = () : React.ReactElement => {
  const [elements, setElements] = useState<number[][]>([[]]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [pivotIndex, setPivotIndex] = useState<number | null>(null);
  const [hiddenIndices, setHiddenIndices] = useState<(number[] | null)[]>([]);
  const [stepSpeed, setStepSpeed] = useState<number>(DEFAULT_SPEED);
  const [outputText, setOutputText] = useState<string>('');

  const { elementRefs, animateSwap } = useSwapAnimation();
  const isAnimatingRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const isStoppedRef = useRef<boolean>(false);
  const speedRef = useRef<number>(stepSpeed);
  const algoSelectRef = useRef<HTMLSelectElement | null>(null);
  const levelIndexRef = useRef<number>(0);
  const comparisonCountRef = useRef<number>(0);

  // Populate array on first load
  useEffect(() => {
    generateRandom(MAX_ELEMENTS);
  }, []);

  /** Add element to array number */
  function addElement(arrayIndex : number) {
    if (elements[arrayIndex].length >= MAX_ELEMENTS) {
      return;
    }

    const newEl = Math.floor(Math.random() * MAX_VALUE + 1);

    setElements((prevElements) => {
        const newElements = [...prevElements];
        const newSubArray = [...newElements[arrayIndex], newEl];
        newElements[arrayIndex] = newSubArray;
        return newElements;
    });
  }

  /** Remove element from array number */
  function removeElement(arrayIndex : number) {
    if (elements[arrayIndex].length <= 1) {
      return;
    }

    setElements((prevElements) => {
      const newElements = [...prevElements];
      const newSubArray = [...newElements[arrayIndex].slice(0, -1)];
      newElements[arrayIndex] = newSubArray;
      return newElements;
    });
  }

  /** Change element in array number */
  function changeElement(arrayIndex: number, element: string, index : number) {
    let nextEl = parseInt(element);
    if(nextEl < MIN_VALUE || nextEl > MAX_VALUE) {
      return;
    }
    else if (isNaN(nextEl)) {
      nextEl = MIN_VALUE;
    }

    const nextElements = elements[arrayIndex].map((el, idx) => {
      if (idx === index) {
        return nextEl;
      }
      else {
        return el;
      }
    });

    setElements((prevElements) => {
      const newElements = [...prevElements];
      const newSubArray = nextElements;
      newElements[arrayIndex] = newSubArray;
      return newElements;
    });
  }

  function setElementsAtIndex(newElems : number[], index : number) {
    setElements((prevElements) => {
      const newElements = [...prevElements];
      const newSubArray = newElems;
      newElements[index] = newSubArray;
      return newElements;
    });
  }

  function setHiddenIndicesAtIndex(newIdx : number[] | null, index : number) {
    setHiddenIndices((prevIndices) => {
      const newIndices = [...prevIndices];
      const newIndicesLevel = newIdx;
      newIndices[index] = newIndicesLevel;
      return newIndices;
    });
  }

  /** Read and execute the animation instructions */
  async function animateSort(sortSteps : SortingAlgorithms.StepData[]) {
    setCurrentIndex(null);
    setPivotIndex(null);
    setOutputText('Sorting');
    isAnimatingRef.current = true;
    levelIndexRef.current = 0;
    isStoppedRef.current = false;

    let swaps = 0;
    let dotNumber = 0;

    for (let i = 0; i < sortSteps.length; i++) {
      await checkforPause();
      if (checkForStop()) {
        break;
      }
      
      // Dots animation
      dotNumber = i % 4;
      let dots = '';
      for (let j = 0; j < dotNumber; j++) {
        dots += '.';
      }
      setOutputText(`Sorting${dots}`);

      switch (sortSteps[i][0]) {
        case SortingAlgorithms.AnimationStepEnums.move:
          setCurrentIndex(sortSteps[i][1][0]);
          break;
        case SortingAlgorithms.AnimationStepEnums.movePivot:
          setPivotIndex(sortSteps[i][1][0]);
          break;
        case SortingAlgorithms.AnimationStepEnums.swap:
          setCurrentIndex(sortSteps[i][1][0]);
          await animateSwap(sortSteps[i][1][0], sortSteps[i][1][1], levelIndexRef.current, speedRef.current);
          setElementsAtIndex([...sortSteps[i][2]], levelIndexRef.current);
          setCurrentIndex(sortSteps[i][1][1]);
          swaps++;
          break;
        case SortingAlgorithms.AnimationStepEnums.addLevel:
          setElementsAtIndex(sortSteps[i][2], sortSteps[i][1][0]);
          setHiddenIndicesAtIndex([sortSteps[i][1][1], sortSteps[i][1][2]], levelIndexRef.current);
          levelIndexRef.current++;
          break;
        case SortingAlgorithms.AnimationStepEnums.removeLevel:
          setElementsAtIndex([], sortSteps[i][1][0]);
          levelIndexRef.current--;
          setHiddenIndicesAtIndex(null, levelIndexRef.current);
          setElementsAtIndex([...sortSteps[i][2]], levelIndexRef.current);
          break;
        default:
          break;
      }

      await new Promise(resolve => setTimeout(resolve, speedRef.current));
    }

    setCurrentIndex(null);
    isAnimatingRef.current = false;

    if (!isStoppedRef.current) {
      setOutputText(`DONE. Comparisons: ${comparisonCountRef.current}, Swaps: ${swaps}`);
    }
  }

  
  /** Check if Pause button was pressed */
  async function checkforPause () {
    setOutputText('Paused.')

    await new Promise<void>((resolve) => {
      const checkCondition = () => {
        if (!isPausedRef.current) {
          resolve();
        } else {
          setTimeout(checkCondition, 100);
        }
      };
      checkCondition();
    });

    setOutputText('Sorting...');
  }

  /** Check if Stop button was pressed */
  function checkForStop () : boolean {
    if (isStoppedRef.current) {
      isPausedRef.current = false;
      levelIndexRef.current = 0;
      isAnimatingRef.current = false;

      setCurrentIndex(null);
      setElements([elements[0]]);
      setHiddenIndices([]);
      setOutputText('Stopped.');
    }

    return isStoppedRef.current;
  }

  /** Generate random numbers for array */
  function generateRandom (count : number) {
    let newElems = [];

    for (let i = 0; i < count; i++) {
      const el = Math.floor(Math.random() * MAX_VALUE + 1);
      newElems.push(el);
    }
    setElementsAtIndex(newElems, 0);
  }

  function handlePlayButtonClick () {
    if (isPausedRef.current) {
      isPausedRef.current = false;
    }
    else if (!isAnimatingRef.current) {
      let steps : SortingAlgorithms.StepData[] = [['', [], []]];
      let comparisons = 0;

      switch (algoSelectRef.current?.value) {
        case SortingAlgorithms.SortingAlgorithmsEnums.bubbleSort:
          [steps, comparisons] = SortingAlgorithms.generateBubbleSortSteps(elements[0]);
          break;
        case SortingAlgorithms.SortingAlgorithmsEnums.insertionSort:
          [steps, comparisons] = SortingAlgorithms.generateInsertionSortSteps(elements[0]);
          break;
        case SortingAlgorithms.SortingAlgorithmsEnums.selectionSort:
          [steps, comparisons] = SortingAlgorithms.generateSelectionSortSteps(elements[0]);
          break;
        case SortingAlgorithms.SortingAlgorithmsEnums.quickSort:
          [steps, comparisons] = SortingAlgorithms.generateQuickSortSteps(elements[0], 0);
          break;
        default:
          break;
      }

      comparisonCountRef.current = comparisons;
      animateSort(steps);
    }
  }

  function handlePauseButtonClick () {
    if (isAnimatingRef.current) {
      isPausedRef.current = true;
    }
  }

  function handleStopButtonClick () {
    if (isAnimatingRef.current) {
      isStoppedRef.current = true;
    }
  }

  function handleRandomButtonClick () {
    if (isAnimatingRef.current) {
      return;
    }

    generateRandom(elements[0].length);
  }

  return (
    <div className='AlgorithmVisualizerContainer'>
      <div className='AlgoControls'>
        <select ref={algoSelectRef} className='AlgoSelect' name='AlgoSelect'>
          {sortingAlgorithmsList.map((algo) => (
            <option key={algo}>{algo}</option>
          ))}
        </select>
        <button className='ControlButton' onClick={() => handlePlayButtonClick()}> ▶ </button>
        <button className='ControlButton' onClick={() => handlePauseButtonClick()}> II </button>
        <button className='ControlButton' onClick={() => handleStopButtonClick()}> ■ </button>
        <button className='ControlButton' onClick={() => handleRandomButtonClick()}> 🎲 </button>
      </div>
      <div className='AlgoControls'>
        <p>Step Speed:</p>
        <input
          className='SpeedSlider' type='range' min='100' max='1000'
          value={stepSpeed}
          onChange={(el) => { 
            setStepSpeed(el.target.valueAsNumber);
            speedRef.current = el.target.valueAsNumber;
            }}>
        </input>
        <p>{stepSpeed} ms</p>
      </div>
      <div className='AlgoControls Console'>
        {outputText}
      </div>
      <div className='ArrayContainer'>
        <button className='ArrayButton' onClick={() => removeElement(0)}>-</button>
        <div className='ElementsContainer'>
          {elements.map((_, i) => (
            <div key={i} className='ElementRow'>
              {elements[i].map((el, idx) => (
              <input
                key={idx}
                name={idx.toString()}
                ref={(el) => {
                  // There is no ref array at this level
                  if (!elementRefs.current[i]) {
                    elementRefs.current[i] = [];
                  }
                  
                  elementRefs.current[i][idx] = el;
                }}
                className={
                  `Element
                  ${(hiddenIndices[i] &&
                    hiddenIndices[i] !== undefined &&
                    (idx >= hiddenIndices[i][0] && idx <= hiddenIndices[i][1])) ? ' hidden' : ''}
                  ${(isAnimatingRef.current && (i === levelIndexRef.current) && (currentIndex === idx)) ? ' outlinedRed' : ''}
                  ${(isAnimatingRef.current && (i === levelIndexRef.current) && (pivotIndex === idx)) ? ' outlinedBlue' : ''}`
                }
                value={el? el.toString() : ''}
                onChange={(el) => changeElement(0, el.target.value, idx)}
              >
              </input>
              ))}
            </div>
          ))}
        </div>
        <button className='ArrayButton' onClick={() => addElement(0)}>+</button>
      </div>
    </div>
  )
}

export default AlgorithmVisualizer
