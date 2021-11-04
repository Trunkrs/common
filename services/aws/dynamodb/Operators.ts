import {
  BeginsWith,
  Between,
  Contains,
  GreaterThan,
  GreaterThanOrEquals,
  In,
  LesserThan,
  LesserThanOrEquals,
  NotEquals,
} from './utils/operators'

class Operators {
  public static beginsWith(startValue: string): BeginsWith {
    return BeginsWith.fromValue(startValue)
  }

  public static between(valueStart: number, valueEnd: number): Between {
    return Between.fromValue(valueStart, valueEnd)
  }

  public static contains(partialValue: string): Contains {
    return Contains.fromValue(partialValue)
  }

  public static greaterThan(numberToExceed: number | string): GreaterThan {
    return GreaterThan.fromValue(numberToExceed)
  }

  public static greaterThanOrEquals(
    valueToExceedOrMatch: number | string,
  ): GreaterThanOrEquals {
    return GreaterThanOrEquals.fromValue(valueToExceedOrMatch)
  }

  public static in(values: Array<string | number>): In {
    return In.fromValue(values)
  }

  public static lesserThan(numberToMaintain: number | string): LesserThan {
    return LesserThan.fromValue(numberToMaintain)
  }

  public static lesserThanOrEquals(
    valueToMaintainOrMatch: number | string,
  ): LesserThanOrEquals {
    return LesserThanOrEquals.fromValue(valueToMaintainOrMatch)
  }

  public static notEquals(valueToExclude: number | string): NotEquals {
    return NotEquals.fromValue(valueToExclude)
  }
}

export default Operators
