const Author = require("../models/author");
const asyncHandler = require("express-async-handler");
const Book = require("../models/book");
const {
    body,
    validationResult
} = require("express-validator");

// Display list of all Authors.
exports.author_list = asyncHandler(async (req, res, next) => {
    const authorList = await Author.find({}).exec();

    res.render("author_list", {
        title: "Author List",
        authorList: authorList
    });
});

// Display detail page for a specific Author.
exports.author_detail = asyncHandler(async (req, res, next) => {
    const [author, booksOfAuthor] = await Promise.all([
        Author.findById(req.params.id).exec(),
        Book.find({
            author: req.params.id
        }).exec()
    ]);

    if (author === null) {
        // No results.
        const err = new Error("Author not found");
        err.status = 404;
        return next(err);
    }

    res.render("author_detail", {
        title: "Author Detail",
        author: author,
        author_books: booksOfAuthor
    });
});

// Display Author create form on GET.
exports.author_create_get = (req, res, next) => {
    res.render("author_form", {
        title: "Create Author"
    });
};

// Handle Author create on POST.
exports.author_create_post = [
    body("first_name")
    .trim()
    .isLength({
        min: 1
    }).escape().withMessage("First Name must be specified")
    .isAlphanumeric()
    .withMessage("First name includes non-alpha characters"),
    body("family_name")
    .trim()
    .isLength({
        min: 1
    }).escape().withMessage("Family Name must be specified")
    .isAlphanumeric()
    .withMessage("Family name includes non-alpha characters"),
    body("date_of_birt", "Invalid date of birth")
    .optional({
        values: "falsy"
    })
    .isISO8601()
    .toDate(),
    body("date_of_death", "Invalid date of death")
    .optional({
        values: "falsy"
    })
    .isISO8601()
    .toDate(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create Author object with escaped and trimmed data
        const author = new Author({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death,
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render("author_form", {
                title: "Create Author",
                author: author,
                errors: errors.array(),
            });
            return;
        } else {
            // Data from form is valid.

            // Save author.
            await author.save();
            // Redirect to new author record.
            res.redirect(author.url);
        }
    }),
];

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
    const [author, allBooksByAuthor] = await Promise.all([
        Author.findById(req.params.id).exec(),
        Book.find({
            author: req.params.id
        }, "title summary").exec()
    ]);

    if (author === null) {
        res.redirect("/catalog/authors");
    }

    res.render("author_delete", {
        title: "Delete Author",
        author: author,
        author_books: allBooksByAuthor
    });
});

// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
    const [author, allBooksByAuthor] = await Promise.all([
        Author.findById(req.params.id).exec(),
        Book.find({
            author: req.params.id
        }, "title summary").exec()
    ]);

    if (allBooksByAuthor.length > 0) {
        res.render("author_delete", {
            title: "Delete Author",
            author: author,
            author_books: allBooksByAuthor
        });

        return;
    } else {
        await Author.findByIdAndDelete(req.body.authorid);
        res.redirect("/catalog/authors");
    }
});

// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
    const author = await Author.findById(req.params.id).exec();

    if (author === null) {
        const err = new Error("Author not found");
        err.status = 404;
        return next(err);
    }

    res.render("author_form", {
        title: "Update Author",
        author: Author
    });
});

// Handle Author update on POST.
exports.author_update_post = [
    body("first_name")
    .trim()
    .isLength({
        min: 1
    }).escape().withMessage("First Name must be specified")
    .isAlphanumeric()
    .withMessage("First name includes non-alpha characters"),
    body("family_name")
    .trim()
    .isLength({
        min: 1
    }).escape().withMessage("Family Name must be specified")
    .isAlphanumeric()
    .withMessage("Family name includes non-alpha characters"),
    body("date_of_birt", "Invalid date of birth")
    .optional({
        values: "falsy"
    })
    .isISO8601()
    .toDate(),
    body("date_of_death", "Invalid date of death")
    .optional({
        values: "falsy"
    })
    .isISO8601()
    .toDate(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const author = new Author({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death,
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            res.render("author_form", {
                title: "Update Author",
                author: author,
                errors: errors.array(),
            });

            return;
        } else {
            const updatedAuthor = await Author.findByIdAndUpdate(req.params.id, author, {});

            res.redirect(updatedAuthor.url);
        }
    }),
];