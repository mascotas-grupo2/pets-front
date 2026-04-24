"use client";

import { ReactNode, useEffect, useState } from "react";

export type StepDef = {
  key: string;
  label: string;
  icon: ReactNode;
};

export function FormStepper({
  steps,
  current,
}: {
  steps: readonly StepDef[];
  current: number;
}) {
  const [walking, setWalking] = useState(false);
  const [displayed, setDisplayed] = useState(current);

  useEffect(() => {
    if (current === displayed) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWalking(true);
    const t = setTimeout(() => {
      setDisplayed(current);
      setWalking(false);
    }, 380);
    return () => clearTimeout(t);
  }, [current, displayed]);

  const pct = steps.length === 1 ? 0 : (current / (steps.length - 1)) * 100;

  return (
    <div className="stepper" role="list">
      <div
        className={`stepper-pet${walking ? " walking" : ""}`}
        aria-hidden
        style={{ left: `calc(${pct}% * (1 - ${1 / steps.length}) + ${50 / steps.length}%)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            walking ? "/images/stepper/dog-walking.png" : "/images/stepper/dog-standing.png"
          }
          alt=""
        />
      </div>

      {steps.map((step, i) => {
        const state =
          i < current ? "done" : i === current ? "active" : "pending";
        return (
          <div key={step.key} role="listitem" className={`stepper-item ${state}`}>
            <div className="stepper-bubble" aria-hidden>
              {step.icon}
            </div>
            <div className="stepper-label">{step.label}</div>
            {i < steps.length - 1 && (
              <div className="stepper-connector" aria-hidden />
            )}
          </div>
        );
      })}
    </div>
  );
}
