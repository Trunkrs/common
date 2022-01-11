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
  And,
  Or,
  Exists,
  NotExists,
} from './utils/operators'
import DynamoOperator from './utils/operators/DynamoOperator'

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

  public static and(...innerOperators: DynamoOperator[]): And {
    return new And(innerOperators)
  }

  public static or(...innerOperators: DynamoOperator[]): Or {
    return new Or(innerOperators)
  }

  public static exists(): Exists {
    return new Exists()
  }

  public static notExists(): NotExists {
    return new NotExists()
  }
}

export default Operators
