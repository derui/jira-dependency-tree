import type { Meta, StoryObj } from "@storybook/react";

import { PropsWithChildren, useRef } from "react";
import { faker } from "@faker-js/faker";
import { Tooltip, TooltipPositionType } from "./tooltip";

const meta = {
  title: "Atoms/Tooltip",
  component: Tooltip,
  tags: ["autodoc"],
  argTypes: {
    position: { control: "radio", defaultValue: "top", options: ["top", "bottom", "left", "right"] },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

const Wrapper = (props: PropsWithChildren<{ position?: TooltipPositionType }>) => {
  const ref = useRef<HTMLDivElement | null>(null);

  return (
    <div className="w-96 h-96 relative">
      <div className="absolute left-1/2 top-1/2 flex justify-center border" ref={ref}>
        Sample
      </div>
      <Tooltip target={ref} position={props.position}>
        {props.children}
      </Tooltip>
    </div>
  );
};

export const Default: Story = {
  args: {
    target: { current: null },
  },
  render(args) {
    return <Wrapper position={args.position}>Content in tooltip</Wrapper>;
  },
};

export const LongContent: Story = {
  args: {
    target: { current: null },
  },
  render(args) {
    return <Wrapper position={args.position}>{faker.lorem.paragraphs()}</Wrapper>;
  },
};
