export type StrokeSettings = {
  x: number;
  y: number;
};

export type BrushSettings = {
  color: string;
  thickness: number;
};

export type UserStack = {
  userId: string;
  brushStack: BrushSettings[];
  strokeStack: StrokeSettings[];
  commands: DrawListCommand[];
};

export type SerializedDrawlistCommand = {
  name: string;
  cursor: number;
  userId: string;
  localCursor: number;
  data: any;
};

export function serializeDrawListCommand(
  command: DrawListCommand
): SerializedDrawlistCommand {
  return {
    name: command.name,
    userId: command.userId,
    cursor: command.cursor,
    localCursor: command.localCursor,
    data: command.getData(),
  };
}

export function unserilaizeDrawListCommand(
  commandData: SerializedDrawlistCommand
): DrawListCommand {
  const functions = {
    [PushBrushDrawCommand.name]: () => {
      return new PushBrushDrawCommand(commandData.data);
    },
    [PopBrushDrawCommand.name]: () => {
      return new PopBrushDrawCommand();
    },
    [StrokeDrawCommand.name]: () => {
      return new StrokeDrawCommand(commandData.data);
    },
    [EndStrokeDrawCommand.name]: () => {
      return new EndStrokeDrawCommand(commandData.data);
    },
  };

  const fn = functions[commandData.name];
  if (fn === undefined) {
    throw new Error(`Invalid type ${commandData.name}`);
  }
  const command = fn();
  command.userId = commandData.userId;
  command.cursor = commandData.cursor;
  command.localCursor = commandData.localCursor;
  return command;
}

export abstract class DrawListCommand {
  public localCursor = 0;
  public cursor = 0;
  public userId = '';
  public abstract get name(): string;
  public abstract getData(): any;
  public abstract draw(
    ctx: CanvasRenderingContext2D,
    userStack: UserStack
  ): void;
}

export class PushBrushDrawCommand extends DrawListCommand {
  public color = '#000000';
  public thickness = 1;
  public get name() {
    return PushBrushDrawCommand.name;
  }
  constructor({ color, thickness }: { color: string; thickness: number }) {
    super();
    this.color = color;
    this.thickness = thickness;
  }
  public getData() {
    return {
      color: this.color,
      thickness: this.thickness,
    };
  }
  public draw(ctx: CanvasRenderingContext2D, userStack: UserStack): void {
    userStack.brushStack.push({
      color: this.color,
      thickness: this.thickness,
    });
  }
}

export class PopBrushDrawCommand extends DrawListCommand {
  public get name() {
    return PopBrushDrawCommand.name;
  }
  public getData() {
    return {};
  }
  public draw(ctx: CanvasRenderingContext2D, userStack: UserStack): void {
    userStack.brushStack.pop();
  }
}

export class StrokeDrawCommand extends DrawListCommand {
  public stroke: StrokeSettings = {
    x: 0,
    y: 0,
  };
  public get name() {
    return StrokeDrawCommand.name;
  }
  public getData() {
    return {
      stroke: this.stroke,
    };
  }
  constructor({ stroke }: { stroke: StrokeSettings }) {
    super();
    this.stroke = stroke;
  }
  public draw(ctx: CanvasRenderingContext2D, userStack: UserStack): void {
    userStack.strokeStack.push(this.stroke);

    if (userStack.brushStack.length === 0) {
      throw new Error('No brush applied');
    }

    const from =
      userStack.strokeStack.length === 1
        ? userStack.strokeStack[userStack.strokeStack.length - 1]
        : userStack.strokeStack[userStack.strokeStack.length - 2];
    const to = userStack.strokeStack[userStack.strokeStack.length - 1];

    const brush = userStack.brushStack[userStack.brushStack.length - 1];
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = brush.color;
    ctx.lineWidth = brush.thickness;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.closePath();
  }
}

export class EndStrokeDrawCommand extends StrokeDrawCommand {
  public get name() {
    return EndStrokeDrawCommand.name;
  }
  public draw(ctx: CanvasRenderingContext2D, userStack: UserStack): void {
    super.draw(ctx, userStack);
    userStack.strokeStack.splice(0, userStack.strokeStack.length);
  }
}
