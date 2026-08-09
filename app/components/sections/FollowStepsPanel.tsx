"use client";

import { useState } from "react";
import styles from "./InteractionBlueprint.module.css";

const FOLLOW_STEPS = [
  ["01", "상호작용 감지", "Interaction detection"],
  ["02", "인풋 편의성 고려", "Input convenience"],
  ["03", "환경 컨디션 파악", "Environmental Conditions"],
  ["04", "대기상태", "Standby"],
] as const;

type DeviceGroup = {
  device: string;
  items: { label: string; value: string }[];
};

type FollowDetail = {
  pill: string | null;
  title: string;
  body: string;
  footnote?: string;
  deviceCompare?: {
    best: DeviceGroup[];
    worst: DeviceGroup[];
  };
};

const FOLLOW_DETAILS: FollowDetail[] = [
  {
    pill: "UWB 파악",
    title: "여기저기, 나의 움직임을 따라서",
    body: "스킵은 활성화 된 환경 중 실시간으로 유저가 직접 조작하는 곳을 찾아다닙니다.\n여러명의 패킷이 들어가있는 환경에서는 나의 인증 환경의 UWB를 통해 해당 상호작용이 나임을 감지합니다.",
    footnote:
      "UWB(Ultra-Wideband): 500MHz 이상의 넓은 주파수 대역과 짧은 펄스파를 사용하는 근거리 무선 통신 기술",
  },
  {
    pill: "환경 캐시 데이터 파악",
    title: "전달에서 경청까지",
    body: "정보를 전하는 것만큼 중요한 건, 그 자리에서 바로 명령할 수 있는가입니다.\n인풋과 아웃풋을 함께 다룰 수 있는 가장 좋은 환경을 선택하며, 하나의 환경만으로 충분하지 않을 때는 다른 환경의 입력 수단을 함께 활용하되, 이를 위해 사용자가 불필요하게 이동하도록 만들지 않습니다.",
    deviceCompare: {
      best: [
        {
          device: "A device",
          items: [
            { label: "Output", value: "스피커+스크린" },
            { label: "Input", value: "터치+마이크 가능" },
          ],
        },
      ],
      worst: [
        {
          device: "B device",
          items: [{ label: "Output", value: "스피커+스크린" }],
        },
        {
          device: "C device",
          items: [{ label: "Input", value: "터치+마이크 가능" }],
        },
      ],
    },
  },
  {
    pill: "환경 캐시 데이터 파악",
    title: "최고의 환경을 선별해가며",
    body: "SKEEP은 새로운 환경으로 옮겨가기 전, 해당 환경이 안전하게 상호작용할 수 있는 상태인지 먼저 확인합니다.\n과열은 없는지, 배터리는 충분한지, 정보를 처리할 여력이 되는지 점검하고, 안정적인 작동이 어렵다고 판단되면 이동하지 않고 기존 환경에서 대기합니다.",
  },
  {
    pill: "세션 활성 여부 파악",
    title: "상호작용이 없을 땐 조용히 머무는 SKEEP.",
    body: "수면 상황처럼 별도의 상호작용이 없는 경우, SKEEP은 조용히 기다립니다.\n사용자의 새로운 상호작용이 감지될 때 까지 사용자의 앵커 환경 중 가장 익숙한 환경에 머물며\n꼭 필요한 정보만 푸시알람의 형태로 남겨둡니다.",
    footnote: "Ex: 잠든 사이 에어컨이 조절되었다면, 깨어난 뒤 그 사실만은 짧게 전합니다.",
  },
];

export function FollowStepsPanel() {
  const [activeStep, setActiveStep] = useState(0);
  const detail = FOLLOW_DETAILS[activeStep];

  return (
    <div className={styles.followPanel}>
      <div className={styles.followSteps} role="tablist" aria-label="SKEEP following 단계">
        {FOLLOW_STEPS.map(([number, title, english], index) => (
          <button
            type="button"
            role="tab"
            key={number}
            className={index === activeStep ? styles.followStepActive : styles.followStep}
            data-step={index}
            onClick={() => setActiveStep(index)}
            aria-selected={index === activeStep}
          >
            <span>{number}</span>
            <h3>{title}</h3>
            <p>{english}</p>
          </button>
        ))}
      </div>
      <div className={styles.followDetail}>
        {detail.pill && <span>{detail.pill}</span>}
        <h3>{detail.title}</h3>
        <p>{detail.body}</p>
        {detail.deviceCompare && (
          <div className={styles.deviceCompare}>
            <div className={styles.deviceRow}>
              <span className={styles.deviceRowLabel}>Best case</span>
              <div className={styles.deviceGroup}>
                {detail.deviceCompare.best.map((group) => (
                  <div className={styles.deviceBox} key={group.device}>
                    <span className={styles.deviceBoxLabel}>{group.device}</span>
                    <div className={styles.deviceItems}>
                      {group.items.map((item) => (
                        <div className={styles.deviceItem} key={item.label}>
                          <b>{item.label}</b>
                          <span>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.deviceRow}>
              <span className={styles.deviceRowLabel}>Worst case</span>
              <div className={styles.deviceGroup}>
                {detail.deviceCompare.worst.map((group) => (
                  <div className={styles.deviceBox} key={group.device}>
                    <span className={styles.deviceBoxLabel}>{group.device}</span>
                    <div className={styles.deviceItems}>
                      {group.items.map((item) => (
                        <div className={styles.deviceItem} key={item.label}>
                          <b>{item.label}</b>
                          <span>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {detail.footnote && <small>{detail.footnote}</small>}
      </div>
    </div>
  );
}
