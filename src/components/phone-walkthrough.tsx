import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

const steps = ["Scan the QR code", "Select content", "View on the sign"];
const visionScreens = [
  { src: "/assets/phone-workflow/vision-plan-screen-2.png", alt: "Neighborhood Vision Plan: a place for everyone in MidTown" },
  { src: "/assets/phone-workflow/vision-plan-screen-3.png", alt: "Neighborhood Vision Plan: the community’s guiding vision" },
];

export function PhoneScanExample() {
  return <div className="phone-scan-example">
    <div className="phone-scan-example-pictures">
      <img className="phone-scan-example-photo" src="/assets/eng-sign-daves-full.jpg" alt="The MidTown digital sign at Dave’s Market, with its QR poster and a person holding a phone" />
      <div className="phone-scan-example-code"><img src="/assets/phone-workflow/midtown-qr.png" alt="QR code for the MidTown screen controller" /><span>Scan with your phone’s camera</span></div>
    </div>
    <p>Scan the QR code with your phone to choose what appears on this screen.</p>
  </div>;
}

/** Source illustrations stay together so the scan, tap and result read as one process. */
export function PhoneWalkthrough({ running, onComplete }: { running: boolean; onComplete?: () => void }) {
  const completedLoops = useRef(0);
  const completion = useRef(onComplete);
  completion.current = onComplete;
  const [step, setStep] = useState(0);
  const [screen, setScreen] = useState(0);
  const selectVision = () => { setScreen(0); setStep(2); };
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      if (step === 2 && screen < visionScreens.length - 1) setScreen(s => s + 1);
      else {
        if (step === 2 && ++completedLoops.current === 2) completion.current?.();
        setStep(s => (s + 1) % steps.length);
        setScreen(0);
      }
    }, step === 2 ? 7000 : 4500);
    return () => window.clearTimeout(timer);
  }, [running, step, screen]);
  return <div className="phone-walkthrough" data-phone-walkthrough data-step={step} data-running={running}>
    <div className="phone-howto" role="group" aria-label="Walkthrough steps">
      {steps.map((s, n) => <div key={s} className={`phone-howto-stage phone-howto-stage-${n}`} data-active={n === step}>
        <button type="button" className="phone-howto-label" aria-label={`Step ${n + 1}: ${s}`} aria-pressed={n === step} onClick={() => { setScreen(0); setStep(n); }}><span>{n + 1}.</span> {s}</button>
        {n === 0 && <div className="phone-scan-art">
          <div className="phone-scan-code"><img src="/assets/phone-workflow/midtown-qr.png" alt="QR code beside a MidTown digital sign" /><span className="phone-scan-beam" aria-hidden="true" /></div>
          <img className="phone-scan-character" src="/assets/phone-workflow/squirrel-phone.png" alt="Illustrated squirrel raising a phone to scan the QR code" />
        </div>}
        {n === 1 && <div className="phone-tap-art">
          <img className="phone-held-art" src="/assets/phone-workflow/holding-phone.png" alt="Illustrated hand holding a phone" />
          <img className="phone-controller-art" src="/assets/phone-workflow/midtown-controller.png" alt="MidTown phone controller with Vision Plan among the content choices" />
          <button type="button" className="phone-tap-target" data-selected={step >= 1} aria-label="Choose Vision Plan on the phone" aria-pressed={step === 2} onClick={selectVision} />
          <img className="phone-finger-art" src="/assets/phone-workflow/tapping-hand.png" alt="Illustrated finger tapping Vision Plan" />
        </div>}
        {n === 2 && <div className="phone-result-art">
          <div className="phone-monitor-art">
            <img className="phone-monitor-frame" src="/assets/phone-workflow/monitor.png" alt="Illustrated digital sign" />
            <img className="phone-monitor-content" data-visible={step !== 2} src="/assets/phone-workflow/midtown-idle.png" alt="Dave’s Market content before the selection" aria-hidden={step === 2} />
            <img className="phone-monitor-content" data-visible={step === 2} src={visionScreens[screen].src} alt={visionScreens[screen].alt} data-vision-screen={screen} aria-hidden={step !== 2} />
          </div>
        </div>}
        {n < 2 && <ArrowRight className="phone-process-arrow" aria-hidden="true" />}
      </div>)}
    </div>
    <span className="sr-only">Interactive illustration. Choose Vision Plan on the phone to show original screens from the Neighborhood Vision Plan presentation. This preview does not control a public sign.</span>
  </div>;
}
