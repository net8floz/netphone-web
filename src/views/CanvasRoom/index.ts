type DrawlistInstanceData = Record<string, unknown>;

export type CanvasDrawlistUpdate = {
  commands: SerializedDrawlistCommand[];
};

export interface CanvasSocketEmits {
  'canvas-drawlist:join': (roomId: string) => void;
  'canvas-drawlist:update': (
    localCursor: number,
    cursor: number,
    commands: SerializedDrawlistCommand[]
  ) => void;
  'canvas-drawlist:sync': (cursor: number) => void;
  'canvas-drawlist:leave': (roomId: string) => void;
}

export interface CanvasSocketEvents {
  'canvas-drawlist:update': (update: CanvasDrawlistUpdate) => void;
  'canvas-drawlist:user-join': () => void;
  'canvas-drawlist:join': (roomId: string) => void;
}

export type StrokeSettings = {
  x: number;
  y: number;
};

export type CommandName = 'PushBrush' | 'PopBrush' | 'Stroke' | 'EndStroke';

export type CanvasBrush = {
  color1: string;
  color2: string;
  thickness: number;
};

export type BrushSettings = {
  color: string;
  thickness: number;
};

export type UserStack = {
  socketUserId: string;
  brush: {
    color: string;
    thickness: number;
  };
  strokeStack: StrokeSettings[];
  commands: DrawListCommand[];
};

export type SerializedDrawlistCommand = {
  name: CommandName;
  cursor: number;
  socketUserId: string;
  localCursor: number;
  data: DrawlistInstanceData;
};

export function serializeDrawListCommand(
  command: DrawListCommand
): SerializedDrawlistCommand {
  return {
    name: command.name,
    socketUserId: command.socketUserId,
    cursor: command.cursor,
    localCursor: command.localCursor,
    data: command.getData(),
  };
}

export function unserilaizeDrawListCommand(
  commandData: SerializedDrawlistCommand
): DrawListCommand {
  let command: DrawListCommand;
  switch (commandData.name) {
    case 'EndStroke':
      command = new EndStrokeDrawCommand(commandData.data as any);
      break;
    case 'Stroke':
      command = new StrokeDrawCommand(commandData.data as any);
      break;
    case 'PushBrush':
      command = new PushBrushDrawCommand(commandData.data as any);
      break;
    default:
      throw new Error(`Invalid type ${commandData.name}`);
  }

  command.socketUserId = commandData.socketUserId;
  command.cursor = commandData.cursor;
  command.localCursor = commandData.localCursor;
  return command;
}

export abstract class DrawListCommand {
  public localCursor = 0;
  public cursor = 0;
  public socketUserId = '';
  public abstract get name(): CommandName;
  public abstract getData(): DrawlistInstanceData;
  public abstract draw(
    ctx: CanvasRenderingContext2D,
    userStack: UserStack
  ): void;
}

export class PushBrushDrawCommand extends DrawListCommand {
  public color = '#000000';
  public thickness = 1;
  public get name(): CommandName {
    return 'PushBrush';
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
    userStack.brush = {
      color: this.color,
      thickness: this.thickness,
    };
  }
}

export class StrokeDrawCommand extends DrawListCommand {
  public stroke: StrokeSettings = {
    x: 0,
    y: 0,
  };
  public get name(): CommandName {
    return 'Stroke';
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
    if (!userStack.brush.color) {
      throw new Error('no color applied to brush');
    }

    userStack.strokeStack.push(this.stroke);

    const from =
      userStack.strokeStack.length === 1
        ? userStack.strokeStack[userStack.strokeStack.length - 1]
        : userStack.strokeStack[userStack.strokeStack.length - 2];
    const to = userStack.strokeStack[userStack.strokeStack.length - 1];

    const brush = userStack.brush;
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
  public get name(): CommandName {
    return 'EndStroke';
  }
  public draw(ctx: CanvasRenderingContext2D, userStack: UserStack): void {
    super.draw(ctx, userStack);
    userStack.strokeStack.splice(0, userStack.strokeStack.length);
  }
}
