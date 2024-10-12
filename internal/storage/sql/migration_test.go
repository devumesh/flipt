package sql_test

import (
	"context"
	"time"

	"github.com/gofrs/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.flipt.io/flipt/internal/storage"
	fliptsql "go.flipt.io/flipt/internal/storage/sql"
	"go.flipt.io/flipt/rpc/flipt"
)

func (s *DBTestSuite) TestDeleteAllContents() {
	t := s.T()
	ctx := context.Background()

	// create namespaces
	ns, err := s.store.CreateNamespace(ctx, &flipt.CreateNamespaceRequest{
		Key:         t.Name(),
		Name:        "foo",
		Description: "bar",
	})

	require.NoError(t, err)
	assert.NotNil(t, ns)

	// create flag in default and newly created namespace namespace
	fReqs := []*flipt.CreateFlagRequest{
		{
			Key:         uuid.Must(uuid.NewV4()).String(),
			Name:        "foo",
			Description: "bar",
			Enabled:     true,
		},
		{
			Key:          uuid.Must(uuid.NewV4()).String(),
			Name:         "foo",
			Description:  "bar",
			NamespaceKey: ns.Key,
		},
	}

	for _, req := range fReqs {
		if s.db.Driver == fliptsql.MySQL {
			// required for MySQL since it only s.stores timestamps to the second and not millisecond granularity
			time.Sleep(time.Second)
		}
		_, err := s.store.CreateFlag(ctx, req)
		require.NoError(t, err)
	}

	// create a segment
	sReqs := []*flipt.CreateSegmentRequest{
		{
			Key:         uuid.Must(uuid.NewV4()).String(),
			Name:        "foo",
			Description: "bar",
		},
		{
			Key:          uuid.Must(uuid.NewV4()).String(),
			Name:         "foo",
			Description:  "bar",
			NamespaceKey: ns.Key,
		},
	}

	for _, req := range sReqs {
		_, err := s.store.CreateSegment(ctx, req)
		require.NoError(t, err)
	}

	// create a constraint
	_, err = s.store.CreateConstraint(ctx, &flipt.CreateConstraintRequest{
		SegmentKey: sReqs[0].Key,
		Type:       flipt.ComparisonType_STRING_COMPARISON_TYPE,
		Property:   "foo",
		Operator:   flipt.OpEQ,
		Value:      "bar",
	})
	require.NoError(t, err)

	// create a flag rule
	_, err = s.store.CreateRule(ctx, &flipt.CreateRuleRequest{
		FlagKey:    fReqs[0].Key,
		SegmentKey: sReqs[0].Key,
		Rank:       1,
	})
	require.NoError(t, err)

	err = s.store.DeleteAllContents(ctx)
	s.NoError(err)

	// check if all contents are deleted
	nsList, err := s.store.ListNamespaces(ctx, storage.ListWithOptions(
		storage.ReferenceRequest{},
	))
	require.NoError(t, err)
	got := nsList.Results
	assert.Len(t, got, 1)
	assert.Equal(t, "default", got[0].Key)
	assert.Equal(t, "Default", got[0].Name)
	assert.Equal(t, "Default namespace", got[0].Description)
	assert.Equal(t, true, got[0].Protected)
	
	flagList, err := s.store.ListFlags(ctx, storage.ListWithOptions(storage.NewNamespace(storage.DefaultNamespace)))
	require.NoError(t, err)
	assert.Len(t, flagList.Results, 0)

	segmentList, err := s.store.ListSegments(ctx, storage.ListWithOptions(storage.NewNamespace(storage.DefaultNamespace)))
	require.NoError(t, err)
	assert.Len(t, segmentList.Results, 0)

	// creating the test injected namespace again for other testcases to run properly
	_, err = s.store.CreateNamespace(ctx, &flipt.CreateNamespaceRequest{
		Key:         s.namespace,
	})
	require.NoError(t, err)
}
