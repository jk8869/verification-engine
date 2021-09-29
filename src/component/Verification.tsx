import React, { useState, useEffect } from 'react';
import '../style/styles.css';
import Button from './Button.js';
import { fetchChecks, submitCheckResults } from '../api.js';
import Greeting from './Greeting';

interface CheckItem {
  id: string;
  description: string;
  answer: true | false | undefined;
  disabled: boolean;
  priority: number;
}

interface Result {
  checkId: string;
  result: 'yes' | 'no';
}

export default function Verification() {
  const [checkList, setCheckList] = useState<CheckItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitStatus, setSubmitStatus] = useState<boolean>(false);
  const [greeting, setGreeting] = useState<boolean>(false);

  const handleSubmitStatus = () => {
    let yesCheck = 0;
    let tempSubmitStatus = false;
    checkList.forEach((check) => {
      if (check.answer === false) {
        tempSubmitStatus = true;
      } else if (check.answer === true) {
        yesCheck += 1;
      }
    });
    if (yesCheck === checkList.length) {
      tempSubmitStatus = true;
    }
    setSubmitStatus(tempSubmitStatus);
  };

  const handleYesAnswer = (index: number) => {
    setCheckList([]);
    checkList[index].answer = true;
    if (index + 1 < checkList.length) {
      checkList[index + 1].disabled = false;
    }
    setCheckList(checkList);
    handleSubmitStatus();
  };

  const handleNoAnswer = (index: number) => {
    setCheckList([]);
    checkList.forEach((checkItem, itemIndex) => {
      if (itemIndex > index) {
        checkItem.disabled = true;
        checkItem.answer = undefined;
      }
    });
    checkList[index].answer = false;
    setCheckList(checkList);
    handleSubmitStatus();
  };

  const handleClick = (index: number, answer: boolean) => {
    if (answer === true) {
      handleYesAnswer(index);
    } else {
      handleNoAnswer(index);
    }
    setCurrentIndex(index);
  };

  const submitCheckList = () => {
    const checkResults: Result[] = [];
    checkList.forEach((item: CheckItem) => {
      if (item.disabled === false) {
        const result: Result = {
          checkId: item.id,
          result: item.disabled === false ? 'no' : 'yes',
        };
        checkResults.push(result);
      }
    });
    submitCheckResults(checkResults)
      .then(() => setGreeting(true))
      .catch((e) => Error(e));
  };

  useEffect(() => {
    fetchChecks()
      .then((res: any) => {
        const checkListArray: CheckItem[] = [];
        res.forEach((item: any) => {
          const checkItem: CheckItem = {
            id: item.id,
            description: item.description,
            answer: undefined,
            disabled: true,
            priority: item.priority,
          };
          checkListArray.push(checkItem);
        });
        checkListArray.sort((a, b) => a.priority - b.priority);
        if (checkListArray.length > 0) {
          setCheckList(checkListArray);
          checkListArray[0].disabled = false;
        }
      })
      .catch((e: any) => () => console.log(e));
  }, []);

  useEffect(() => {
    const handleKeyEvent = (event: any) => {
      switch (event.key) {
        case 'ArrowUp':
          if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
          }
          break;
        case 'ArrowDown':
          if (
            currentIndex < checkList.length - 1 &&
            checkList[currentIndex + 1].disabled === false
          ) {
            setCurrentIndex(currentIndex + 1);
          }
          break;
        case '1':
          if (checkList.length > 0) {
            handleYesAnswer(currentIndex);
          }
          break;
        case '2':
          if (checkList.length > 0) {
            handleNoAnswer(currentIndex);
          }
          break;
        // no default
      }
    };

    handleSubmitStatus();

    window.addEventListener('keydown', handleKeyEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyEvent);
    };
  }, [checkList, currentIndex]);

  if (greeting) return <Greeting />;

  if (checkList.length === 0) return <div>loading...</div>;

  return (
    <div className="App">
      {checkList.map((checkItem, index) => (
        <div key={checkItem.id}>
          <div className={`box ${index === currentIndex ? 'highlight' : ''}`}>
            <p>{checkItem.description}</p>
            <Button
              className={`Button ${
                checkItem.answer === true ? 'selected' : 'undefined'
              }`}
              disabled={checkItem.disabled}
              onClick={() => handleClick(index, true)}
            >
              Yes
            </Button>
            <Button
              className={`Button ${
                checkItem.answer === false ? 'selected' : 'undefined'
              }`}
              disabled={checkItem.disabled}
              onClick={() => handleClick(index, false)}
            >
              No
            </Button>
          </div>
        </div>
      ))}
      <Button
        className={`Button ${
          submitStatus !== false ? 'selected' : 'undefined'
        }`}
        disabled={!submitStatus}
        onClick={submitCheckList}
      >
        Submit
      </Button>
    </div>
  );
}
