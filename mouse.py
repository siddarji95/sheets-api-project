import pyautogui
import time
pyautogui.FAILSAFE = False

for i in range(0,30):
       pyautogui.moveTo(0, i * 5)
while True:
    for i in range(0,3):
       pyautogui.press('shift')
    time.sleep(540)