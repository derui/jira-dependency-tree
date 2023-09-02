import type { Meta, StoryObj } from "@storybook/react";
import { EditableRelationDraft } from "./editable-relation-draft";
import { randomIssue } from "@/mock-data";
import { issueToIssueModel } from "@/view-models/issue";
import { RelationModel } from "@/view-models/relation";
import { AppendingRelationDeltaModel, DeletingRelationDeltaModel } from "@/view-models/relation-delta";

const meta = {
  title: "Organisms/Editable Relation",
  component: EditableRelationDraft,
  tags: ["autodocs"],
  argTypes: {
    draft: { control: "object" },
  },
} satisfies Meta<typeof EditableRelationDraft>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoTouched: Story = {
  args: {
    draft: {
      kind: "NoTouched",
      relation: {
        relationId: "1",
        inward: issueToIssueModel(randomIssue()),
        outward: issueToIssueModel(randomIssue()),
      } as RelationModel,
    },
    onRequestDelete: () => {},
  },
};

export const TouchedAsDeletion: Story = {
  args: {
    draft: {
      kind: "Touched",
      delta: {
        kind: "delete",
        relation: {
          relationId: "1",
          inward: issueToIssueModel(randomIssue()),
          outward: issueToIssueModel(randomIssue()),
        },
      } as DeletingRelationDeltaModel,
    },
  },
};

export const TouchedAsAppending: Story = {
  args: {
    draft: {
      kind: "Touched",
      delta: {
        kind: "append",
        deltaId: "1",
        inwardIssue: issueToIssueModel(randomIssue()),
        outwardIssue: issueToIssueModel(randomIssue()),
      } as AppendingRelationDeltaModel,
    },
  },
};
