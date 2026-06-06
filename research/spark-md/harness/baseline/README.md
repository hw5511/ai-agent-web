# 미감 게이트 baseline

`floor.png` = `aesthetic-gate.sh`가 pairwise 비교에 쓰는 **고정 기준선(최소 합격선)** 스크린샷이다.

- **역할**: 후보 산출물이 이 floor보다 *양방향 모두* 못하면(=확실히 나쁨) FAIL. 순위가 아니라 "확실히 나쁜 것"만 거르는 coarse gate라, floor는 "최고"가 아니라 **"이 정도는 돼야 하는 깔끔하지만 평범한 한 장"**이어야 한다.
- **현재 floor 출처**: R14 v7 observatory("이안 관측소") 첫 화면(1280×800, CDN 차단 정적 렌더). 히어로 가독성·타이포 위계·스탯카드 구성이 명료하나 시각적 파격은 절제된, 합격선으로 적합한 한 장.
- **교체 방법**: 더 엄격/느슨하게 조이려면 다른 산출물의 첫 화면으로 갈아끼우면 된다.
  ```bash
  PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers npx playwright screenshot \
    --viewport-size=1280,800 --wait-for-timeout=2500 --block-service-workers \
    "file:///tmp/spark-lab/<라운드>/<name>/index.html" floor.png
  ```
- **주의**: 샌드박스는 외부 CDN(폰트·GSAP)을 차단하므로 floor도 후보도 *정적 구성*만 담긴다. 둘이 같은 조건이라 비교는 공정하다. 모션 품질은 라이브에서 별도 확인.
