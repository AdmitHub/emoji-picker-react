import clsx from 'clsx';
import * as React from 'react';

import { ClassNames } from '../../DomUtils/classNames';
import { useSkinTonesDisabledConfig } from '../../config/useConfig';
import skinToneVariations, {
  skinTonesNamed
} from '../../data/skinToneVariations';
import { setSkinTone } from '../../dataUtils/skinTone';
import { useCloseAllOpenToggles } from '../../hooks/useCloseAllOpenToggles';
import { useFocusSearchInput } from '../../hooks/useFocus';
import { KeyboardEvents } from '../../hooks/useKeyboardNavigation';
import { SkinTones } from '../../types/exposedTypes';
import Absolute from '../Layout/Absolute';
import Relative from '../Layout/Relative';
import { Button } from '../atoms/Button';
import { useSkinTonePickerRef } from '../context/ElementRefContext';
import {
  useActiveSkinToneState,
  useSkinToneFanOpenState
} from '../context/PickerContext';
import './SkinTonePicker.css';

const ITEM_SIZE = 28;

type Props = {
  direction?: SkinTonePickerDirection;
};

export function SkinTonePickerMenu() {
  return (
    <Relative style={{ height: ITEM_SIZE }}>
      <Absolute style={{ bottom: 0, right: 0 }}>
        <SkinTonePicker direction={SkinTonePickerDirection.VERTICAL} />
      </Absolute>
    </Relative>
  );
}

export function SkinTonePicker({
  direction = SkinTonePickerDirection.HORIZONTAL
}: Props) {
  const SkinTonePickerRef = useSkinTonePickerRef();
  const isDisabled = useSkinTonesDisabledConfig();
  const [isOpen, setIsOpen] = useSkinToneFanOpenState();
  const [activeSkinTone, setActiveSkinTone] = useActiveSkinToneState();
  const closeAllOpenToggles = useCloseAllOpenToggles();
  const focusSearchInput = useFocusSearchInput();

  if (isDisabled) {
    return null;
  }

  const fullWidth = `${ITEM_SIZE * skinToneVariations.length}px`;

  const expandedSize = isOpen ? fullWidth : ITEM_SIZE + 'px';

  const vertical = direction === SkinTonePickerDirection.VERTICAL;

  return (
    <Relative
      className={clsx('epr-skin-tones', direction, {
        [ClassNames.open]: isOpen
      })}
      style={
        vertical
          ? { flexBasis: expandedSize, height: expandedSize }
          : { flexBasis: expandedSize }
      }
      tabIndex={0}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
        const { key } = event;
        if (key === KeyboardEvents.Enter) {
          if (!isOpen) {
            setIsOpen(true)
          }
          closeAllOpenToggles();
        }
      }}
    >
      <div className="epr-skin-tone-select" ref={SkinTonePickerRef} >
        {skinToneVariations.map((skinToneVariation, i) => {
          const active = skinToneVariation === activeSkinTone;
          return (
            <Button
              style={{
                transform: clsx(
                  vertical
                    ? `translateY(-${i * (isOpen ? ITEM_SIZE : 0)}px)`
                    // library fans out colors to the left of the selected one
                    // it was requested that the selected one should move left and the rest of the colors should fan out to the right
                    // to aid with tab-accessibility
                    : `translateX(${(i * (isOpen ? ITEM_SIZE : 0)) - (isOpen ? ((skinToneVariations.length - 1) * ITEM_SIZE) : 0)}px)`,
                  isOpen && active && 'scale(1.3)'
                )
              }}
              onClick={() => {
                if (isOpen) {
                  setActiveSkinTone(skinToneVariation);
                  setSkinTone(skinToneVariation)
                  focusSearchInput();
                } else {
                  setIsOpen(true);
                }
                closeAllOpenToggles();
              }}
              // when tabbed onto the SkinTonePicker, allow Enter to open and close the fan of colors
              onKeyDown={(event) => {
                const { key } = event;
                if (key === KeyboardEvents.Enter) {
                  if (isOpen) {
                    setActiveSkinTone(skinToneVariation);
                    setSkinTone(skinToneVariation)
                    focusSearchInput();
                  } else {
                    setIsOpen(true);
                  }
                  closeAllOpenToggles();
                }
              }}
              tabIndex={isOpen ? 0 : -1}
              key={skinToneVariation}
              className={clsx(`epr-tone-${skinToneVariation}`, 'epr-tone', {
                [ClassNames.active]: active
              })}
              aria-pressed={active}
              aria-label={`Skin tone ${skinTonesNamed[skinToneVariation as SkinTones]
                }`}
            ></Button>
          );
        })}
      </div>
    </Relative>
  );
}

export enum SkinTonePickerDirection {
  VERTICAL = ClassNames.vertical,
  HORIZONTAL = ClassNames.horizontal
}
