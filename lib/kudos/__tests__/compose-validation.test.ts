import { describe, it, expect } from "vitest";
import {
  MAX_HASHTAGS,
  MAX_IMAGES,
  ACCEPTED_IMAGE_TYPES,
  isAcceptedImageType,
  isComposeInputValid,
  assertValidCreateKudosInput,
} from "../compose-validation";
import type { CreateKudosInput } from "../types";

describe("compose-validation", () => {
  describe("constants", () => {
    it("MAX_HASHTAGS should be 5", () => {
      expect(MAX_HASHTAGS).toBe(5);
    });

    it("MAX_IMAGES should be 5", () => {
      expect(MAX_IMAGES).toBe(5);
    });

    it("ACCEPTED_IMAGE_TYPES should contain jpeg and png only", () => {
      expect(ACCEPTED_IMAGE_TYPES).toEqual(["image/jpeg", "image/png"]);
      expect(ACCEPTED_IMAGE_TYPES).toHaveLength(2);
    });
  });

  describe("isAcceptedImageType()", () => {
    it("should accept image/jpeg", () => {
      expect(isAcceptedImageType("image/jpeg")).toBe(true);
    });

    it("should accept image/png", () => {
      expect(isAcceptedImageType("image/png")).toBe(true);
    });

    it("should reject image/gif", () => {
      expect(isAcceptedImageType("image/gif")).toBe(false);
    });

    it("should reject application/pdf", () => {
      expect(isAcceptedImageType("application/pdf")).toBe(false);
    });

    it("should reject video/mp4", () => {
      expect(isAcceptedImageType("video/mp4")).toBe(false);
    });

    it("should reject text/plain", () => {
      expect(isAcceptedImageType("text/plain")).toBe(false);
    });

    it("should be case-sensitive", () => {
      expect(isAcceptedImageType("IMAGE/JPEG")).toBe(false);
    });

    it("should reject empty string", () => {
      expect(isAcceptedImageType("")).toBe(false);
    });
  });

  describe("isComposeInputValid()", () => {
    const validInput: CreateKudosInput = {
      receiverId: "user-2",
      title: "Great work!",
      content: "You did an amazing job on this feature.",
      hashtagSlugs: ["teamwork", "innovation"],
      imageUrls: [],
      isAnonymous: false,
      anonymousName: null,
    };

    it("should return true for valid complete input", () => {
      expect(isComposeInputValid(validInput)).toBe(true);
    });

    it("should return true for valid input with all 5 hashtags", () => {
      const input: CreateKudosInput = {
        ...validInput,
        hashtagSlugs: ["tag1", "tag2", "tag3", "tag4", "tag5"],
      };
      expect(isComposeInputValid(input)).toBe(true);
    });

    it("should return true for valid input with all 5 images", () => {
      const input: CreateKudosInput = {
        ...validInput,
        imageUrls: [
          "data:image/png;base64,abc1",
          "data:image/png;base64,abc2",
          "data:image/png;base64,abc3",
          "data:image/png;base64,abc4",
          "data:image/png;base64,abc5",
        ],
      };
      expect(isComposeInputValid(input)).toBe(true);
    });

    describe("receiver validation", () => {
      it("should return false when receiverId is empty string", () => {
        expect(
          isComposeInputValid({
            ...validInput,
            receiverId: "",
          })
        ).toBe(false);
      });

      it("should return false when receiverId is whitespace only", () => {
        expect(
          isComposeInputValid({
            ...validInput,
            receiverId: "   ",
          })
        ).toBe(false);
      });

      it("should return false when receiverId equals senderId", () => {
        expect(isComposeInputValid(validInput, "user-2")).toBe(false);
      });

      it("should return true when receiverId differs from senderId", () => {
        expect(isComposeInputValid(validInput, "user-1")).toBe(true);
      });

      it("should return true when senderId is not provided", () => {
        expect(isComposeInputValid(validInput)).toBe(true);
      });
    });

    describe("title validation", () => {
      it("should return false when title is empty string", () => {
        expect(
          isComposeInputValid({
            ...validInput,
            title: "",
          })
        ).toBe(false);
      });

      it("should return false when title is whitespace only", () => {
        expect(
          isComposeInputValid({
            ...validInput,
            title: "   \t\n  ",
          })
        ).toBe(false);
      });

      it("should return true when title has meaningful content after trim", () => {
        expect(
          isComposeInputValid({
            ...validInput,
            title: "  \n  Great work!  \t  ",
          })
        ).toBe(true);
      });

      it("should return true for minimal single-character title", () => {
        expect(
          isComposeInputValid({
            ...validInput,
            title: "A",
          })
        ).toBe(true);
      });
    });

    describe("content validation", () => {
      it("should return false when content is empty string", () => {
        expect(
          isComposeInputValid({
            ...validInput,
            content: "",
          })
        ).toBe(false);
      });

      it("should return false when content is whitespace only", () => {
        expect(
          isComposeInputValid({
            ...validInput,
            content: "  \n\n  \t  ",
          })
        ).toBe(false);
      });

      it("should return true when content has meaningful text after trim", () => {
        expect(
          isComposeInputValid({
            ...validInput,
            content: "  \n  Amazing work!  \t  ",
          })
        ).toBe(true);
      });

      it("should return true for minimal single-character content", () => {
        expect(
          isComposeInputValid({
            ...validInput,
            content: "X",
          })
        ).toBe(true);
      });
    });

    describe("hashtag validation", () => {
      it("should return false when hashtagSlugs is empty array", () => {
        expect(
          isComposeInputValid({
            ...validInput,
            hashtagSlugs: [],
          })
        ).toBe(false);
      });

      it("should return true when hashtagSlugs has exactly 1 tag", () => {
        expect(
          isComposeInputValid({
            ...validInput,
            hashtagSlugs: ["tag1"],
          })
        ).toBe(true);
      });

      it("should return true when hashtagSlugs has exactly 5 tags", () => {
        expect(
          isComposeInputValid({
            ...validInput,
            hashtagSlugs: ["tag1", "tag2", "tag3", "tag4", "tag5"],
          })
        ).toBe(true);
      });

      it("should return false when hashtagSlugs has 6 tags", () => {
        expect(
          isComposeInputValid({
            ...validInput,
            hashtagSlugs: ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"],
          })
        ).toBe(false);
      });

      it("should return false when hashtagSlugs has 0 tags", () => {
        expect(
          isComposeInputValid({
            ...validInput,
            hashtagSlugs: [],
          })
        ).toBe(false);
      });
    });

    describe("image validation", () => {
      it("should return true when imageUrls is empty array", () => {
        expect(
          isComposeInputValid({
            ...validInput,
            imageUrls: [],
          })
        ).toBe(true);
      });

      it("should return true when imageUrls has exactly 5 images", () => {
        expect(
          isComposeInputValid({
            ...validInput,
            imageUrls: ["url1", "url2", "url3", "url4", "url5"],
          })
        ).toBe(true);
      });

      it("should return false when imageUrls has 6 images", () => {
        expect(
          isComposeInputValid({
            ...validInput,
            imageUrls: ["url1", "url2", "url3", "url4", "url5", "url6"],
          })
        ).toBe(false);
      });

      it("should return false when imageUrls has more than 6 images", () => {
        expect(
          isComposeInputValid({
            ...validInput,
            imageUrls: Array(10).fill("url"),
          })
        ).toBe(false);
      });

      it("should return true for 1 image", () => {
        expect(
          isComposeInputValid({
            ...validInput,
            imageUrls: ["url1"],
          })
        ).toBe(true);
      });
    });
  });

  describe("assertValidCreateKudosInput()", () => {
    const validInput: CreateKudosInput = {
      receiverId: "user-2",
      title: "Great work!",
      content: "You did an amazing job on this feature.",
      hashtagSlugs: ["teamwork", "innovation"],
      imageUrls: [],
      isAnonymous: false,
      anonymousName: null,
    };

    it("should not throw for valid input", () => {
      expect(() => {
        assertValidCreateKudosInput(validInput, "user-1");
      }).not.toThrow();
    });

    it("should not throw when receiver is different from sender", () => {
      expect(() => {
        assertValidCreateKudosInput(validInput, "different-user");
      }).not.toThrow();
    });

    describe("invalid receiver errors", () => {
      it("should throw with correct message when receiverId is empty", () => {
        expect(() => {
          assertValidCreateKudosInput(
            {
              ...validInput,
              receiverId: "",
            },
            "user-1"
          );
        }).toThrow("Invalid receiver: must be a different user");
      });

      it("should throw with correct message when receiver equals sender", () => {
        expect(() => {
          assertValidCreateKudosInput(validInput, "user-2");
        }).toThrow("Invalid receiver: must be a different user");
      });
    });

    describe("title errors", () => {
      it("should throw with correct message when title is empty", () => {
        expect(() => {
          assertValidCreateKudosInput(
            {
              ...validInput,
              title: "",
            },
            "user-1"
          );
        }).toThrow("Title must not be empty");
      });

      it("should throw with correct message when title is whitespace only", () => {
        expect(() => {
          assertValidCreateKudosInput(
            {
              ...validInput,
              title: "   \n  ",
            },
            "user-1"
          );
        }).toThrow("Title must not be empty");
      });
    });

    describe("content errors", () => {
      it("should throw with correct message when content is empty", () => {
        expect(() => {
          assertValidCreateKudosInput(
            {
              ...validInput,
              content: "",
            },
            "user-1"
          );
        }).toThrow("Content must not be empty");
      });

      it("should throw with correct message when content is whitespace only", () => {
        expect(() => {
          assertValidCreateKudosInput(
            {
              ...validInput,
              content: "  \t\n  ",
            },
            "user-1"
          );
        }).toThrow("Content must not be empty");
      });
    });

    describe("hashtag errors", () => {
      it("should throw with correct message when no hashtags provided", () => {
        expect(() => {
          assertValidCreateKudosInput(
            {
              ...validInput,
              hashtagSlugs: [],
            },
            "user-1"
          );
        }).toThrow("Select between 1 and 5 hashtags");
      });

      it("should throw with correct message when too many hashtags provided", () => {
        expect(() => {
          assertValidCreateKudosInput(
            {
              ...validInput,
              hashtagSlugs: ["t1", "t2", "t3", "t4", "t5", "t6"],
            },
            "user-1"
          );
        }).toThrow("Select between 1 and 5 hashtags");
      });

      it("should not throw with exactly 1 hashtag", () => {
        expect(() => {
          assertValidCreateKudosInput(
            {
              ...validInput,
              hashtagSlugs: ["tag1"],
            },
            "user-1"
          );
        }).not.toThrow();
      });

      it("should not throw with exactly 5 hashtags", () => {
        expect(() => {
          assertValidCreateKudosInput(
            {
              ...validInput,
              hashtagSlugs: ["t1", "t2", "t3", "t4", "t5"],
            },
            "user-1"
          );
        }).not.toThrow();
      });
    });

    describe("image errors", () => {
      it("should throw with correct message when too many images", () => {
        expect(() => {
          assertValidCreateKudosInput(
            {
              ...validInput,
              imageUrls: ["url1", "url2", "url3", "url4", "url5", "url6"],
            },
            "user-1"
          );
        }).toThrow("Maximum 5 images allowed");
      });

      it("should not throw with exactly 5 images", () => {
        expect(() => {
          assertValidCreateKudosInput(
            {
              ...validInput,
              imageUrls: ["url1", "url2", "url3", "url4", "url5"],
            },
            "user-1"
          );
        }).not.toThrow();
      });

      it("should not throw with 0 images", () => {
        expect(() => {
          assertValidCreateKudosInput(
            {
              ...validInput,
              imageUrls: [],
            },
            "user-1"
          );
        }).not.toThrow();
      });
    });

    describe("error precedence", () => {
      it("should check receiver before title", () => {
        expect(() => {
          assertValidCreateKudosInput(
            {
              ...validInput,
              receiverId: "user-1",
              title: "",
            },
            "user-1"
          );
        }).toThrow("Invalid receiver: must be a different user");
      });

      it("should check title before content", () => {
        expect(() => {
          assertValidCreateKudosInput(
            {
              ...validInput,
              title: "",
              content: "",
            },
            "user-1"
          );
        }).toThrow("Title must not be empty");
      });

      it("should check content before hashtags", () => {
        expect(() => {
          assertValidCreateKudosInput(
            {
              ...validInput,
              content: "",
              hashtagSlugs: [],
            },
            "user-1"
          );
        }).toThrow("Content must not be empty");
      });

      it("should check hashtags before images", () => {
        expect(() => {
          assertValidCreateKudosInput(
            {
              ...validInput,
              hashtagSlugs: [],
              imageUrls: Array(10).fill("url"),
            },
            "user-1"
          );
        }).toThrow("Select between 1 and 5 hashtags");
      });
    });
  });

  describe("integration: isComposeInputValid and assertValidCreateKudosInput alignment", () => {
    const validInput: CreateKudosInput = {
      receiverId: "user-2",
      title: "Great work!",
      content: "You did an amazing job.",
      hashtagSlugs: ["teamwork"],
      imageUrls: [],
      isAnonymous: false,
      anonymousName: null,
    };

    it("valid input should pass both checks", () => {
      expect(isComposeInputValid(validInput, "user-1")).toBe(true);
      expect(() => {
        assertValidCreateKudosInput(validInput, "user-1");
      }).not.toThrow();
    });

    it("invalid receiver should fail both checks", () => {
      const invalidInput = { ...validInput, receiverId: "" };
      expect(isComposeInputValid(invalidInput, "user-1")).toBe(false);
      expect(() => {
        assertValidCreateKudosInput(invalidInput, "user-1");
      }).toThrow("Invalid receiver: must be a different user");
    });

    it("empty title should fail both checks", () => {
      const invalidInput = { ...validInput, title: "" };
      expect(isComposeInputValid(invalidInput, "user-1")).toBe(false);
      expect(() => {
        assertValidCreateKudosInput(invalidInput, "user-1");
      }).toThrow("Title must not be empty");
    });

    it("empty content should fail both checks", () => {
      const invalidInput = { ...validInput, content: "" };
      expect(isComposeInputValid(invalidInput, "user-1")).toBe(false);
      expect(() => {
        assertValidCreateKudosInput(invalidInput, "user-1");
      }).toThrow("Content must not be empty");
    });

    it("no hashtags should fail both checks", () => {
      const invalidInput = { ...validInput, hashtagSlugs: [] };
      expect(isComposeInputValid(invalidInput, "user-1")).toBe(false);
      expect(() => {
        assertValidCreateKudosInput(invalidInput, "user-1");
      }).toThrow("Select between 1 and 5 hashtags");
    });

    it("too many images should fail both checks", () => {
      const invalidInput = {
        ...validInput,
        imageUrls: Array(6).fill("url"),
      };
      expect(isComposeInputValid(invalidInput, "user-1")).toBe(false);
      expect(() => {
        assertValidCreateKudosInput(invalidInput, "user-1");
      }).toThrow("Maximum 5 images allowed");
    });
  });
});
