import { FC, useEffect, useRef } from "react";
import classes from './slider.module.scss'
import { ChangeInput } from "../changeInput/ChangeInput";


interface IProps {
    min: number;
    max: number;
    valueMax: number;
    valueMin: number;
    setValueMax: (valueMax: number) => void;
    setValueMin: (valueMin: number) => void;
    onBlur: (valMin: number, valMax: number) => void;
}

export const Slider: FC<IProps> = ({min, max, valueMax, valueMin, setValueMax, setValueMin, onBlur}) => {

    const slider = useRef<HTMLDivElement>(null)
    const refThumbMin = useRef<HTMLDivElement>(null)
    const refThumbMax = useRef<HTMLDivElement>(null)
    const refInactiveLeft = useRef<HTMLDivElement>(null)
    const refInactiveRight = useRef<HTMLDivElement>(null)

    

    const setGrab = () => {
        document.body.style.cursor = 'grab'
    }

    const deleteGrab = () => {
        document.body.style.cursor = ''
    }

    const onmousedownMin = (e: MouseEvent) => {
        setGrab()

        e.preventDefault()
        document.body.style.touchAction = 'none'; // Блокируем скролл
                
        if(refThumbMin.current){
            const shiftX = e.clientX - refThumbMin.current.getBoundingClientRect().left;
        
            let targetMin = valueMin;

            document.addEventListener('pointermove', onMouseMove)
            document.addEventListener('pointerup', onMouseUp);
            
            function onMouseMove(event: MouseEvent){
                
                event.preventDefault()

                if(slider.current && refThumbMin.current && refInactiveLeft.current && refThumbMax.current){
                    const leftSlider = slider.current.getBoundingClientRect().left
                    let newLeft = event.clientX - shiftX - leftSlider;
                    
                    if(newLeft < 0){
                        newLeft = 0;
                    }
                    
                    let rightEdge = slider.current.offsetWidth - refThumbMin.current.offsetWidth;
                    
                    if(newLeft > rightEdge){
                        newLeft = rightEdge;
                    }

                    let leftThumbMax = refThumbMax.current.getBoundingClientRect().left - leftSlider
                    if(newLeft > leftThumbMax){
                        newLeft = leftThumbMax
                    }

                    const p = Math.round(newLeft) / (slider.current.offsetWidth - refThumbMin.current.offsetWidth);
                    const numb = (min + (max - min) * p)
                    setValueMin(Math.round(numb))
                    targetMin = Math.round(numb)
                }
            }

            function onMouseUp() {
                deleteGrab()
                document.body.style.touchAction = ''; // Восстанавливаем скролл
                document.removeEventListener('pointerup', onMouseUp);
                document.removeEventListener('pointermove', onMouseMove);
                onBlur(targetMin, valueMax)
            }
        }
    }

    const onmousedownMax = (e: MouseEvent) => {
        setGrab()
        e.preventDefault()
        document.body.style.touchAction = 'none';

        if(refThumbMax.current){
            const shiftX = e.clientX - refThumbMax.current.getBoundingClientRect().left;
            
            document.addEventListener('pointermove', onMouseMove)
            document.addEventListener('pointerup', onMouseUp);
            
            let targetMax = valueMax;

            function onMouseMove(event: MouseEvent){
                event.preventDefault();
                if(slider.current && refThumbMax.current && refInactiveRight.current && refThumbMin.current){

                    const leftSlider =  slider.current.getBoundingClientRect().left;
                    let newLeft = event.clientX - shiftX - leftSlider;
                    
                    const leftThumbMin = refThumbMin.current.getBoundingClientRect().left - leftSlider;  

                    if(leftThumbMin > newLeft){
                        newLeft = leftThumbMin;
                    }

                    if(newLeft < 0){
                        newLeft = 0;
                    }
                    
                    let rightEdge = slider.current.offsetWidth - refThumbMax.current.offsetWidth;
                    
                    if(newLeft > rightEdge){
                        newLeft = rightEdge;
                    }

                    const p = Math.round(newLeft) / (slider.current.offsetWidth - refThumbMax.current.offsetWidth);
                    const numb = (min + (max - min) * p)
                    setValueMax(Math.round(numb))
                    targetMax = Math.round(numb)
                }
            }

            function onMouseUp() {
                deleteGrab()
                document.body.style.touchAction = '';
                document.removeEventListener('pointerup', onMouseUp);
                document.removeEventListener('pointermove', onMouseMove);
                onBlur(valueMin, targetMax)
            }
        }
    }


    useEffect(() => {
        if(slider.current && refThumbMax.current && refInactiveRight.current){
            const p = (max - min) / (slider.current.offsetWidth - refThumbMax.current.offsetWidth);
            let r = ((valueMax - min) / p)
            refThumbMax.current.style.left = r / slider.current.offsetWidth * 100 + '%'
            refInactiveRight.current.style.width = 100 - r / (slider.current.offsetWidth - refThumbMax.current.offsetWidth) * 100 + '%'
        }
    }, [valueMax])

    useEffect(() => {
        if(slider.current && refThumbMin.current && refInactiveLeft.current){
            if(valueMin === max){
                refThumbMin.current.style.zIndex = '99';
            }
            else{
                refThumbMin.current.style.zIndex = '1';
            }
            const p = (max - min) / (slider.current.offsetWidth - refThumbMin.current.offsetWidth);
            let r = ((valueMin - min) / p)
            refThumbMin.current.style.left = r / slider.current.offsetWidth * 100 + '%'
            refInactiveLeft.current.style.width =  r / slider.current.offsetWidth * 100 + '%'
        }
    }, [valueMin])

    useEffect(() => {
        if(refThumbMin.current &&  refThumbMax.current && slider.current){

            refThumbMin.current.onpointerdown = onmousedownMin;
            refThumbMax.current.onpointerdown = onmousedownMax;

            refThumbMin.current.ondragstart = function() {
                return false;
            };
            refThumbMax.current.ondragstart = function() {
                return false;
            };
        }

    }, [valueMin, valueMax])

    

    return (
        <section className={classes.wrapper}>
            <ChangeInput 
                valueMax={valueMax} 
                valueMin={valueMin} 
                max={max} 
                min={min} 
                onBlur={onBlur} 
            />
            <section ref={slider} className={classes.slider}>
                <section ref={refInactiveLeft} className={classes.inactiveLeft}></section>
                <section ref={refInactiveRight} className={classes.inactiveRight}></section>
                <section ref={refThumbMin} className={classes.thumb + " " + classes.min}></section>
                <section ref={refThumbMax} className={classes.thumb + " " + classes.max}></section>
            </section>
        </section>
    )
}